
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Configuration de la "mémoire" du serveur (session)
app.use(session({
    secret: 'cle_secrete_agence',
    resave: false,
    saveUninitialized: true
}));

/*const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', 
    database: 'agence_event', multipleStatements: true 
});*/
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'agence_event',
    port: process.env.MYSQLPORT || 3306,
    multipleStatements: true 
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware : rend l'utilisateur connecté accessible dans tous les EJS
// Place ceci juste AVANT tes routes app.get('/', ...) et app.get('/equipe', ...)
app.use((req, res, next) => {
    if (!req.session.user && req.path !== '/login') {
        return res.redirect('/login');
    }
    next();
});

 
// --- ROUTES DE L'ÉQUIPE ---

// 1. Afficher la page équipe et rôles
app.get('/equipe', (req, res) => {
    const sqlMembres = "SELECT a.*, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";
    const sqlRoles = "SELECT * FROM roles";
    db.query(`${sqlMembres}; ${sqlRoles}`, (err, results) => {
        if (err) throw err;
        res.render('equipe', { membres: results[0], roles: results[1] });
    });
});

// 2. Ajouter un nouveau membre (et lui donner un rôle)
app.post('/admin/ajouter-membre', (req, res) => {
    const { nom, email, password, id_role } = req.body;
    const sql = "INSERT INTO agence (nom, email, mot_de_passe, id_role) VALUES (?, ?, ?, ?)";
    db.query(sql, [nom, email, password, id_role], (err) => {
        if (err) throw err;
        res.redirect('/equipe');
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT a.*, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id WHERE email = ? AND mot_de_passe = ?";
    db.query(sql, [email, password], (err, result) => {
        if (err) throw err; // Ajout de la gestion d'erreur
        if (result.length > 0) {
            req.session.user = result[0];
            res.redirect('/');
        } else {
            res.send("Email ou mot de passe incorrect");
        }
    });
});
// Middleware de protection
app.use((req, res, next) => {
    // Si l'utilisateur n'est pas connecté et qu'il n'est pas sur la page login
    if (!req.session.user && req.path !== '/login') {
        return res.redirect('/login');
    }
    next();
});

// --- SÉCURITÉ : RÉPARATION AUTOMATIQUE DU STOCK TOTAL ---
const patchStock = "UPDATE materiel SET stock_total = stock_agence WHERE stock_total = 0 OR stock_total IS NULL";
db.query(patchStock, (err, res) => {
    if (err) console.error("Erreur patch :", err);
    else if (res.affectedRows > 0) {
        console.log(`✅ LOGISTIQUE : ${res.affectedRows} articles corrigés (Capacité 0 -> Stock Réel)`);
    }
});
// READ
app.get('/', (req, res) => {
    const sqlMat = "SELECT m.*, p.nom_prestation FROM materiel m LEFT JOIN prestation p ON m.id_prestation = p.id";
    const sqlPres = "SELECT * FROM prestation";
    const sqlEvent = "SELECT * FROM evenement";
    const sqlFourn = "SELECT * FROM fournisseur";
    const sqlRes = "SELECT v.*, m.id FROM vue_tableau_bord v JOIN materiel m ON v.nom_article = m.nom_article";

    db.query(`${sqlMat}; ${sqlPres}; ${sqlEvent}; ${sqlFourn}; ${sqlRes}`, (err, results) => {
        if (err) throw err;

        // --- ÉTAPE CRUCIALE : On crée l'objet groupé ---
        const matérielsParPrestation = {};
        
        // results[0] contient la liste de tous les matériels
        results[0].forEach(m => {
            const nomP = m.nom_prestation || "Divers";
            if (!matérielsParPrestation[nomP]) {
                matérielsParPrestation[nomP] = [];
            }
            matérielsParPrestation[nomP].push(m);
        });

        // --- ÉTAPE FINALE : On envoie tout à la vue ---
      res.render('index', {
    materiels: results[0],        //
    materielsGroupes: matérielsParPrestation, 
    prestations: results[1],
    evenements: results[2],
    fournisseurs: results[3],
    reservations: results[4],
});
    });
});


app.post('/reserver-groupe', (req, res) => {
    const { id_event, materiels, quantites, id_fournisseur } = req.body;
    if (!materiels || materiels.length === 0) return res.redirect('/');

    let completed = 0;
    // On récupère l'ID de l'utilisateur connecté (Princia ou Essai)
    // Si tu n'as pas encore de session, on utilise 1 par défaut pour le test
    const userId = req.session && req.session.user ? req.session.user.id : 1;

    materiels.forEach((id_mat, index) => {
        const voulu = parseInt(quantites[index]);
        if (isNaN(voulu) || voulu <= 0) { completed++; return; }

        db.query('SELECT stock_agence FROM materiel WHERE id = ?', [id_mat], (err, results) => {
            if (err) throw err;
            
            const stockDispo = results[0].stock_agence;
            let qte_ag = voulu > stockDispo ? stockDispo : voulu;
            let qte_f = voulu > stockDispo ? (voulu - stockDispo) : 0;

            const sqlIns = 'INSERT INTO reservation (id_evenement, id_materiel, id_fournisseur, quantite_voulue, qte_agence, qte_fournisseur, statut) VALUES (?,?,?,?,?,?, "en_cours")';
            const sqlUpd = 'UPDATE materiel SET stock_agence = stock_agence - ? WHERE id = ?';
            
            // CORRECTION ICI : historique_mouvement (sans le S final)
            const sqlLog = 'INSERT INTO historique_mouvement (id_utilisateur, id_materiel, type_action, quantite) VALUES (?, ?, "sortie", ?)';

            db.query(sqlIns, [id_event, id_mat, id_fournisseur || null, voulu, qte_ag, qte_f], (err) => {
                if (err) throw err;

                db.query(sqlUpd, [qte_ag, id_mat], (err) => {
                    if (err) throw err;

                    // Enregistrement dans l'historique avec le bon nom de table
                    db.query(sqlLog, [userId, id_mat, qte_ag], (err) => {
                        if (err) console.error("Erreur historique détaillée:", err.message);
                        
                        completed++;
                        if (completed === materiels.length) res.redirect('/');
                    });
                });
            });
        });
    });
});
app.post('/admin/retour-materiel', (req, res) => {
    const { id_reservation, id_materiel, qte_agence } = req.body;
    
    // Pour le test, on utilise l'ID 1 (Administrateur/Essai)
    const id_utilisateur_connecte = 1; 

    // 1. Mise à jour du stock
    db.query("UPDATE materiel SET stock_agence = stock_agence + ? WHERE id = ?", [qte_agence, id_materiel], (err) => {
        
        // 2. Mise à jour du statut de la réservation
        db.query("UPDATE reservation SET statut = 'rendu' WHERE id = ?", [id_reservation], (err) => {
            
            // 3. SYNCHRONISATION : On écrit dans l'historique
            const sqlLog = `
                INSERT INTO historique_mouvement 
                (id_utilisateur, id_materiel, type_action, quantite, date_action) 
                VALUES (?, ?, 'retour', ?, NOW())
            `;
            
            db.query(sqlLog, [id_utilisateur_connecte, id_materiel, qte_agence], (err) => {
                if (err) throw err;
                res.redirect('/historique'); // Redirection directe vers le journal
            });
        });
    });
});

app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event } = req.body;
    const sql = 'INSERT INTO evenement (titre, date_event, heure_event, lieu_event) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [titre, date_event, heure_event, lieu_event], (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).send("Erreur lors de l'enregistrement.");
        }
        // Change '/evenements' par '/' si tu veux revenir à l'accueil
        res.redirect('/'); 
    });
});
// Dans app.js, modifie la route existante :
app.get('/evenements', (req, res) => {
    // Affiche aujourd'hui et après
    const sql = 'SELECT * FROM evenement WHERE date_event >= CURDATE() ORDER BY date_event ASC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('evenements', { evenements: results });
    });
});
app.get('/archives', (req, res) => {
    // Affiche tout ce qui est avant aujourd'hui
    const sql = 'SELECT * FROM evenement WHERE date_event < CURDATE() ORDER BY date_event DESC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('archives', { evenements: results });
    });
});

app.post('/reserver', (req, res) => {
    const { id_event, id_mat, qte_voulue, id_fournisseur } = req.body;
    
    db.query('SELECT stock_agence FROM materiel WHERE id = ?', [id_mat], (err, results) => {
        if (err) throw err;
        const stockDispo = results[0].stock_agence;
        const voulu = parseInt(qte_voulue);

        // Répartition intelligente
        let qte_ag = voulu > stockDispo ? stockDispo : voulu;
        let qte_f = voulu > stockDispo ? (voulu - stockDispo) : 0;
        const fId = qte_f > 0 ? id_fournisseur : null;

        // INSERTION + MISE À JOUR DU STOCK (Mouvement de stock)
        const sqlInsert = 'INSERT INTO reservation (id_evenement, id_materiel, id_fournisseur, quantite_voulue, qte_agence, qte_fournisseur, statut) VALUES (?,?,?,?,?,?, "en_cours")';
        const sqlUpdate = 'UPDATE materiel SET stock_agence = stock_agence - ? WHERE id = ?';

        db.query(sqlInsert, [id_event, id_mat, fId, voulu, qte_ag, qte_f], (err) => {
            if (err) throw err;
            // On déduit uniquement ce qui sort de l'agence
            db.query(sqlUpdate, [qte_ag, id_mat], () => res.redirect('/'));
        });
    });
});

// DELETE
app.get('/delete/:id', (req, res) => {
    db.query('DELETE FROM reservation WHERE id = ?', [req.params.id], () => res.redirect('/'));
});


app.post('/admin/materiel', (req, res) => {
    // On récupère les 3 infos du formulaire
    const { nom_article, stock_agence, id_prestation } = req.body; 

    // On prépare l'insertion dans les 4 colonnes
    // On passe stock_agence deux fois : une pour le stock actuel, une pour le total de base
    const sql = 'INSERT INTO materiel (nom_article, stock_agence, stock_total, id_prestation) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [nom_article, stock_agence, stock_agence, id_prestation], (err, result) => {
        if (err) {
            console.error("❌ Erreur Ajout Matériel :", err);
            return res.status(500).send("Erreur lors de l'ajout");
        }
        console.log(`✨ Nouvel article ajouté : ${nom_article} (Total: ${stock_agence})`);
        res.redirect('/'); 
    });
});
// 2. Route pour ajouter un nouveau fournisseur
app.post('/admin/fournisseur', (req, res) => {
    const { nom_societe } = req.body;
    const sql = 'INSERT INTO fournisseur (nom_societe) VALUES (?)';
    
    db.query(sql, [nom_societe], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout du fournisseur:", err);
            return res.status(500).send("Erreur serveur");
        }
        console.log("Nouveau fournisseur enregistré !");
        res.redirect('/');
    });
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/historique', (req, res) => {
    // On remplace 'utilisateurs' par 'agence'
    const sql = `
        SELECT 
            h.type_action,
            h.quantite,
            h.date_action,
            a.nom AS nom_utilisateur, -- Table 'agence', colonne 'nom'
            m.nom_article,
            r.nom_role
        FROM historique_mouvement h
        JOIN agence a ON h.id_utilisateur = a.id
        JOIN roles r ON a.id_role = r.id
        JOIN materiel m ON h.id_materiel = m.id
        ORDER BY h.date_action DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'historique :", err.message);
            return res.status(500).send("Erreur serveur : vérifiez la console.");
        }
        
        res.render('historique', { logs: results });
    });
});
app.get('/', (req, res) => {
    // 1. Définition de toutes les requêtes SQL
    const sqlMat = "SELECT m.*, p.nom_prestation FROM materiel m LEFT JOIN prestation p ON m.id_prestation = p.id";
    const sqlPres = "SELECT * FROM prestation";
    const sqlEvent = "SELECT * FROM evenement";
    const sqlFourn = "SELECT * FROM fournisseur";
    const sqlRes = "SELECT v.*, m.id FROM vue_tableau_bord v JOIN materiel m ON v.nom_article = m.nom_article";

    // Requête pour l'historique (Note : j'ai retiré le JOIN roles pour éviter l'erreur si la table n'existe pas)
    const sqlLogs = `
        SELECT h.*, u.nom AS nom_utilisateur, m.nom_article 
        FROM historique_mouvement h 
        JOIN utilisateurs u ON h.id_utilisateur = u.id 
        JOIN materiel m ON h.id_materiel = m.id 
        ORDER BY h.date_action DESC 
        LIMIT 10`;

    // 2. Exécution des 6 requêtes en une seule fois
    db.query(`${sqlMat}; ${sqlPres}; ${sqlEvent}; ${sqlFourn}; ${sqlRes}; ${sqlLogs}`, (err, results) => {
        if (err) {
            console.error("Erreur SQL détaillée :", err.message);
            // Si la table n'existe pas encore, on renvoie un tableau vide pour 'logs' afin d'éviter le crash EJS
            return res.status(500).send("Erreur SQL : Vérifiez que la table 'historique_mouvement' existe.");
        }

        // 3. Organisation des matériels par prestation (ton code existant)
        const matérielsParPrestation = {};
        results[0].forEach(m => {
            const nomP = m.nom_prestation || "Divers";
            if (!matérielsParPrestation[nomP]) {
                matérielsParPrestation[nomP] = [];
            }
            matérielsParPrestation[nomP].push(m);
        });

        // 4. Envoi de toutes les variables à index.ejs
        res.render('index', {
            materiels: results[0],
            prestations: results[1],
            evenements: results[2],
            fournisseurs: results[3],
            reservations: results[4],
            //logs: results[5], // <--- Indispensable pour index.ejs:299
            materielsGroupes: matérielsParPrestation
        });
    });
});

// AFFICHER la page de login
app.get('/login', (req, res) => {
    res.render('login'); // Assure-toi d'avoir créé login.ejs dans ton dossier views
});

// Dans ton App.js
app.get('/inventaire', (req, res) => {
    const query = `
        SELECT m.*, p.nom_prestation 
        FROM materiel m 
        LEFT JOIN prestation p ON m.id_prestation = p.id`;

    db.query(query, (err, results) => {
        if (err) throw err;

        // On organise les données par prestation
        const inventaireGroupe = results.reduce((acc, item) => {
            const cat = item.nom_prestation || 'Non classé';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        // CORRECTION ICI : Le nom doit être 'groupes'
        res.render('inventaire', { groupes: inventaireGroupe }); 
    });
});
// Route pour créer une nouvelle prestation
app.post('/admin/prestation', (req, res) => {
    const { nom_prestation } = req.body;
    const sql = 'INSERT INTO prestation (nom_prestation) VALUES (?)';
    
    db.query(sql, [nom_prestation], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la création");
        }
        res.redirect('/');
    });
});
app.get('/admin/delete-materiel/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM materiel WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Impossible de supprimer : ce matériel est peut-être utilisé dans une réservation.");
        }
        res.redirect('/inventaire');
    });
});
// Afficher le formulaire d'édition
app.get('/admin/edit-materiel/:id', (req, res) => {
    const sqlMat = "SELECT * FROM materiel WHERE id = ?";
    const sqlPres = "SELECT * FROM prestation";

    db.query(`${sqlMat}; ${sqlPres}`, [req.params.id], (err, results) => {
        if (err) throw err;
        res.render('edit-materiel', { 
            materiel: results[0][0], 
            prestations: results[1] 
        });
    });
});

// Traiter la modification
app.post('/admin/update-materiel/:id', (req, res) => {
    const { nom_article, stock_agence, id_prestation } = req.body;
    const sql = "UPDATE materiel SET nom_article=?, stock_agence=?, id_prestation=? WHERE id=?";
    
    db.query(sql, [nom_article, stock_agence, id_prestation, req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/inventaire');
    });
});

app.post('/update/:id', (req, res) => {
    const { new_qte } = req.body;
    db.query('SELECT id_materiel FROM reservation WHERE id = ?', [req.params.id], (err, row) => {
        if (err || row.length === 0) return res.redirect('/'); // Sécurité

        db.query('SELECT stock_agence FROM materiel WHERE id = ?', [row[0].id_materiel], (err, results) => {
            const stock = results[0].stock_agence;
            const voulu = parseInt(new_qte);
            let qte_ag = voulu > stock ? stock : voulu;
            let qte_f = voulu > stock ? (voulu - stock) : 0;
            
            db.query('UPDATE reservation SET quantite_voulue=?, qte_agence=?, qte_fournisseur=? WHERE id=?', 
            [voulu, qte_ag, qte_f, req.params.id], () => res.redirect('/'));
        });
    });
});
app.listen(4000, () => console.log('Serveur sur http://localhost:4000'));