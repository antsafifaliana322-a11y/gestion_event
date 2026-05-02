//require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 

// 1. SESSION
app.use(session({
    secret: 'cle_secrete_agence',
    resave: false,
    saveUninitialized: true
}));
/*const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost', 
    user: process.env.MYSQLUSER || 'root', 
    password: process.env.MYSQLPASSWORD || '', 
    database: process.env.MYSQLDATABASE || 'agence_event',
    port: process.env.MYSQLPORT || 3306,
    multipleStatements: true 
});
const db = mysql.createConnection({
    host: 'shortline.proxy.rlwy.net', 
    user: 'root', 
    password: 'FudGMEyUccAwAqaYubkslTPVjhBhNYEh', 
    database: 'railway',
    port: 26166,
    multipleStatements: true 
});*/
const db = mysql.createConnection({
    host: 'localhost', user: 'root', password: '', 
    database: 'agence_event', multipleStatements: true 
});db.connect((err) => {
    if (err) {
        console.error("❌ Erreur : Impossible de se connecter au MySQL LOCAL :", err.message);
        return;
    }
    console.log("✅ Connecté à la base locale (localhost)");
});
/*
const db = mysql.createConnection({
    // Railway donnera ces informations automatiquement une fois en ligne
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'agence_event',
    port: process.env.MYSQLPORT || 3306,
    multipleStatements: true 
});*/

// 2. MIDDLEWARE GLOBAL (Pour "Bienvenue [Nom]" et protection)
// 2. MIDDLEWARE GLOBAL (Modifié pour laisser passer le client)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    
    // Ajoute '/reservation' et '/reservation-envoyer' à la liste des exceptions
    const publicRoutes = ['/login', '/reservation', '/reservation-envoyer'];
    
    if (!req.session.user && !publicRoutes.includes(req.path)) {
        return res.redirect('/login');
    }
    next();
});
app.post('/evenements/delete/:id', (req, res) => {
    const id = req.params.id;
    // On supprime d'abord les réservations liées pour éviter les erreurs de clé étrangère
    const sqlDelRes = "DELETE FROM reservation WHERE id_evenement = ?";
    const sqlDelEv = "DELETE FROM evenement WHERE id = ?";

    db.query(sqlDelRes, [id], (err) => {
        if (err) throw err;
        db.query(sqlDelEv, [id], (err) => {
            if (err) throw err;
            res.redirect('/evenements');
        });
    });
});
// Afficher le formulaire de réservation au client
// Cette route doit être AVANT app.listen
/*app.get('/reservation', (req, res) => {
    // On va chercher les prestations dans ta table (vue dans phpMyAdmin)
    db.query("SELECT * FROM prestation", (err, results) => {
        if (err) {
            console.log("Erreur SQL :", err);
            return res.send("Erreur lors de la récupération des données");
        }
        
        // On affiche le fichier views/reservation-client.ejs
        res.render('reservation-client', { 
            prestations: results 
        });
    });
});
app.get('/reservation', (req, res) => {
    // On récupère toutes les prestations pour remplir la liste déroulante
    const sql = "SELECT * FROM prestation";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur :", err.message);
            return res.status(500).send("Erreur de chargement des prestations");
        }
        // On envoie les prestations au fichier EJS
        res.render('reservation-client', { prestations: results });
    });
});*/
app.get('/reservation', (req, res) => {
    // On récupère toutes les prestations pour remplir les checkboxes
    const sql = "SELECT * FROM prestation";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err.message);
            return res.status(500).send("Erreur de chargement des prestations");
        }
        // On envoie les prestations au fichier EJS (reservation-client.ejs)
        res.render('reservation-client', { prestations: results });
    });
});
app.get('/delete/:id', (req, res) => {
    db.query('DELETE FROM reservation WHERE id = ?', [req.params.id], () => res.redirect('/'));
});
// 1. Garde cette route GET pour éviter l'erreur "Cannot GET"
/*app.get('/reservation-envoyer', (req, res) => {
    res.redirect('/reservation');
});

// 2. Garde UNIQUEMENT ce bloc POST (Supprime tous les autres blocs /reservation-envoyer)
app.post('/reservation-envoyer', (req, res) => {
    let { nom_client, date_event, lieu_event, id_prestation } = req.body;

    // Traitement pour les checkboxes multiples
    let prestationsStr = "";
    if (Array.isArray(id_prestation)) {
        prestationsStr = id_prestation.join(', ');
    } else {
        prestationsStr = id_prestation || ""; 
    }

    // Syntaxe SET : la plus sûre pour ton projet à l'ISPM
    const sql = "INSERT INTO evenement SET ?";
    const values = {
        titre: nom_client,
        date_event: date_event,
        lieu_event: lieu_event,
        id_prestation: prestationsStr
    };

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("❌ Erreur d'insertion :", err.message);
            return res.status(500).send("Erreur lors de l'enregistrement : " + err.message);
        }

        // Envoi de SweetAlert et redirection automatique
        res.send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script>
                Swal.fire({
                    title: 'Succès !',
                    text: 'Votre réservation pour ${nom_client} a été enregistrée.',
                    icon: 'success',
                    confirmButtonColor: '#ef4444'
                }).then(() => {
                    window.location.href = '/reservation'; 
                });
            </script>
        `);
    });
});*/

// --- ROUTES AUTH ---
app.get('/login', (req, res) => res.render('login'));
/*app.post('/reservation-envoyer', (req, res) => {
    // On récupère id_prestation depuis le <select name="id_prestation"> du formulaire
    const { nom_client, date_event, lieu_event, id_prestation } = req.body;
    
    // On insère dans la colonne id_prestation que tu viens de créer
    const sql = "INSERT INTO evenement (titre, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nom_client, date_event, lieu_event, id_prestation], (err, result) => {
        if (err) {
            console.error("Erreur d'insertion :", err.message);
            return res.status(500).send("Erreur lors de l'enregistrement : " + err.message);
        }
        res.send("Reservation envoyer");
    });
});*/
/*app.post('/reservation-envoyer', (req, res) => {
    const { nom_client, date_event, lieu_event, id_prestation } = req.body;
    
    // Vérifie que les noms des colonnes correspondent EXACTEMENT à ta base de données
    const sql = "INSERT INTO evenement (titre, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?)";
    
    // Assure-toi qu'aucune de ces variables n'est 'undefined'
    const values = [nom_client, date_event, lieu_event, id_prestation];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Erreur d'insertion :", err.message);
            return res.status(500).send("Erreur lors de l'enregistrement : " + err.message);
        }
        res.send("Réservation envoyée avec succès !");
    });
});*/
/*app.post('/reservation-envoyer', (req, res) => {
    let { nom_client, date_event, lieu_event, id_prestation } = req.body;

    // ÉTAPE CRUCIALE : On vérifie si c'est un tableau (plusieurs choix)
    let prestationsSelectionnees = "";
    
    if (Array.isArray(id_prestation)) {
        // Transforme ['Vidéo', 'Photo'] en "Vidéo, Photo"
        prestationsSelectionnees = id_prestation.join(', '); 
    } else {
        // Si une seule case est cochée, Express renvoie une chaîne simple
        prestationsSelectionnees = id_prestation || "Aucune";
    }

    const sql = "INSERT INTO evenement SET ?";
    const values = {
        titre: nom_client,
        date_event: date_event,
        lieu_event: lieu_event,
        id_prestation: prestationsSelectionnees // On enregistre la chaîne complète
    };

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Erreur d'insertion :", err.message);
            return res.status(500).send("Erreur SQL : " + err.message);
        }
        
        // Redirection vers le dashboard pour voir le résultat
        res.redirect('/dashboard'); 
    });
});*/
/*app.post('/reservation-envoyer', (req, res) => {
    // 1. On récupère id_prestation qui est un tableau grâce aux [] dans le HTML
    let { nom_client, date_event, lieu_event, id_prestation } = req.body;

    // 2. FORCE la conversion en chaîne de caractères
    let prestationsAEnregistrer = "";
    if (Array.isArray(id_prestation)) {
        prestationsAEnregistrer = id_prestation.join(', '); // Devient "Vidéo, test, eclairage"
    } else {
        prestationsAEnregistrer = id_prestation || "";
    }

    const sql = "INSERT INTO evenement (titre, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?)";
    const values = [nom_client, date_event, lieu_event, prestationsAEnregistrer];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/dashboard'); 
    });
});*/
/*app.post('/reservation-envoyer', (req, res) => {
  //  let { nom_client, date_event, lieu_event, id_prestation } = req.body;
console.log("Données reçues du formulaire :", req.body);

    let { nom_client, date_event, lieu_event, id_prestation } = req.body;
    // Transformation du tableau ["Vidéo", "test"] en chaîne "Vidéo, test"
    let prestationsStr = Array.isArray(id_prestation) ? id_prestation.join(', ') : (id_prestation || "");
    
    const sql = "INSERT INTO evenement (titre, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?)";
    db.query(sql, [nom_client, date_event, lieu_event, prestationsStr], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/dashboard');
    });
});
app.post('/reservation-envoyer', (req, res) => {
    let { nom_client, date_event, lieu_event, id_prestation } = req.body;

    // Synchronisation : on transforme le tableau reçu dans le terminal en texte
    let prestationsStr = "";
    if (Array.isArray(id_prestation)) {
        prestationsStr = id_prestation.join(', '); // Devient "Vidéo, test"
    } else {
        prestationsStr = id_prestation || "";
    }

    // IMPORTANT : Vérifie que le nom de la colonne est bien id_prestation
    const sql = "INSERT INTO evenement (titre, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?)";
    db.query(sql, [nom_client, date_event, lieu_event, prestationsStr], (err) => {
        if (err) {
            console.error("Erreur SQL :", err.message);
            return res.status(500).send(err.message);
        }
        res.redirect('/dashboard');
    });
});
app.post('/reservation-envoyer', (req, res) => {
    let { nom_client, date_event, lieu_event, id_prestation } = req.body;

    // On s'assure que prestationsStr est toujours une chaîne de caractères
    let prestationsStr = "";
    if (id_prestation) {
        prestationsStr = Array.isArray(id_prestation) ? id_prestation.join(', ') : id_prestation;
    }

    const sql = "INSERT INTO evenement (titre, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nom_client, date_event, lieu_event, prestationsStr], (err) => {
        if (err) {
            console.error("Erreur SQL :", err.message);
            return res.status(500).send("Erreur lors de l'enregistrement");
        }
        res.redirect('/dashboard');
    });
});
app.post('/reservation-envoyer', (req, res) => {
    // 1. Récupération des données du formulaire
    const { nom_client, titre_evenement, date_event, lieu_event, id_prestation } = req.body;
    
    // On transforme le tableau de prestations en chaîne de caractères pour ta colonne actuelle
    const prestationsStr = Array.isArray(id_prestation) ? id_prestation.join(', ') : id_prestation;

    // 2. PREMIÈRE ÉTAPE : Insérer le client
    const sqlClient = "INSERT INTO client (nom) VALUES (?)";
    
    db.query(sqlClient, [nom_client], (err, result) => {
        if (err) throw err;

        // On récupère l'ID que MySQL vient de générer pour ce client
        const clientId = result.insertId;

        // 3. DEUXIÈME ÉTAPE : Insérer l'événement avec l'ID du client
        const sqlEvent = `
            INSERT INTO evenement (titre, id_client, date_event, lieu_event, id_prestation) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sqlEvent, [titre_evenement, clientId, date_event, lieu_event, prestationsStr], (err, result) => {
            if (err) throw err;
            
            // Redirection vers le dashboard une fois fini
            res.redirect('/evenements'); 
        });
    });
});*/
app.post('/reservation-envoyer', (req, res) => {
    const { email_client, titre_evenement, date_event, lieu_event, id_prestation } = req.body;
    const prestationsStr = Array.isArray(id_prestation) ? id_prestation.join(', ') : id_prestation;

    // 1. On cherche si le client existe déjà
    const sqlCheck = "SELECT id FROM client WHERE email = ?";
    
    db.query(sqlCheck, [email_client], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Le client existe déjà, on utilise son ID
            const clientId = results[0].id;
            insertEvenement(clientId);
        } else {
            // Le client n'existe pas, on le crée
            const sqlInsertClient = "INSERT INTO client (email) VALUES (?)";
            db.query(sqlInsertClient, [email_client], (err, result) => {
                if (err) throw err;
                insertEvenement(result.insertId);
            });
        }
    });

    // Fonction helper pour éviter de répéter le code d'insertion
    function insertEvenement(clientId) {
        const sqlEvent = "INSERT INTO evenement (titre, id_client, date_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?, ?)";
        db.query(sqlEvent, [titre_evenement, clientId, date_event, lieu_event, prestationsStr], (err) => {
            if (err) throw err;
            res.redirect('/evenements');
        });
    }
});
// --- ROUTES AUTH ---
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT a.*, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id WHERE email = ? AND mot_de_passe = ?";
    db.query(sql, [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            req.session.user = result[0];
            res.redirect('/');
        } else {
            res.send("Email ou mot de passe incorrect");
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
/*app.get('/dashboard', (req, res) => {
    // On sélectionne tout de 'evenement' (e) 
    // et on récupère 'nom_prestation' de la table 'prestation' (p)
    const sql = `
        SELECT e.*, p.nom_prestation 
        FROM evenement e
        LEFT JOIN prestation p ON e.id_prestation = p.id 
        ORDER BY e.id DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur SQL :", err.message);
            return res.status(500).send("Erreur de base de données");
        }
        // On envoie les résultats (qui incluent maintenant 'nom_prestation')
        res.render('dashboard', { evenements: results });
    });
});
app.get('/dashboard', (req, res) => {
    // Cette requête lie l'id_prestation de 'evenement' à l'id de 'prestation'
    const sql = `
        SELECT e.*, p.nom_prestation 
        FROM evenement e 
        LEFT JOIN prestation p ON e.id_prestation = p.id 
        ORDER BY e.id DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.render('dashboard', { evenements: results });
    });
});
app.get('/dashboard', (req, res) => {
    // On récupère les réservations (evenements)
    const sql = "SELECT * FROM evenement ORDER BY id DESC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur Dashboard :", err.message);
            return res.status(500).send("Erreur de chargement");
        }
        
        // On envoie 'results' sous le nom 'evenements' pour ton EJS
        res.render('dashboard', { evenements: results });
    });
});*/
/*app.get('/dashboard', (req, res) => {
    // Jointure entre 'evenement' et 'prestation' pour récupérer le nom au lieu de l'ID
    const sql = `
        SELECT e.*, p.nom_prestation 
        FROM evenement e
        LEFT JOIN prestation p ON e.id_prestation = p.id
        ORDER BY e.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur Dashboard :", err.message);
            return res.status(500).send("Erreur de chargement des données");
        }
        
        // On envoie les résultats à la vue
        res.render('dashboard', { evenements: results });
    });
});*/app.get('/dashboard', (req, res) => {
    // Requête simple car les noms sont déjà dans id_prestation
    const sql = "SELECT * FROM evenement ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.render('dashboard', { evenements: results }); 
    });
});
/*app.post('/admin/ajouter-role', (req, res) => {
    const { nom_role } = req.body;
    const sql = "INSERT INTO roles (nom_role) VALUES (?)";

    db.query(sql, [nom_role], (err, result) => {
        if (err) {
            console.error("Erreur role :", err.message);
            return res.status(500).send("Erreur lors de l'ajout du rôle");
        }
        // On redirige vers la même page pour voir le nouveau rôle dans la liste déroulante
        res.redirect('/admin/equipes'); 
    });
});*/
app.post('/admin/ajouter-role', (req, res) => {
    const { nom_role } = req.body;
    const sql = "INSERT INTO roles (nom_role) VALUES (?)";

    db.query(sql, [nom_role], (err, result) => {
        if (err) {
            // Si c'est une erreur de doublon (le rôle existe déjà)
            if (err.code === 'ER_DUP_ENTRY') {
                console.log(`Le rôle "${nom_role}" existe déjà.`);
                return res.redirect('/admin/equipes'); // On redirige simplement sans erreur
            }
            console.error("Erreur role :", err.message);
            return res.status(500).send("Erreur lors de l'ajout du rôle");
        }
        res.redirect('/admin/equipes'); 
    });
});
// --- DASHBOARD PRINCIPAL ---
app.get('/', (req, res) => {
    const sqlMat = "SELECT m.*, p.nom_prestation FROM materiel m LEFT JOIN prestation p ON m.id_prestation = p.id";
    const sqlPres = "SELECT * FROM prestation";
    const sqlEvent = "SELECT * FROM evenement WHERE date_event >= CURDATE() ORDER BY date_event ASC"; 
    const sqlFourn = "SELECT * FROM fournisseur";
    const sqlRes = "SELECT v.*, m.id FROM vue_tableau_bord v JOIN materiel m ON v.nom_article = m.nom_article";

    db.query(`${sqlMat}; ${sqlPres}; ${sqlEvent}; ${sqlFourn}; ${sqlRes}`, (err, results) => {
        if (err) throw err;
        const matérielsParPrestation = {};
        results[0].forEach(m => {
            const nomP = m.nom_prestation || "Divers";
            if (!matérielsParPrestation[nomP]) matérielsParPrestation[nomP] = [];
            matérielsParPrestation[nomP].push(m);
        });

        res.render('index', {
            materiels: results[0],
            materielsGroupes: matérielsParPrestation,
            prestations: results[1],
            evenements: results[2],
            fournisseurs: results[3],
            reservations: results[4]
        });
    });
});
// --- CORRECTIFS POUR TES ERREURS ---
// 1. Afficher le formulaire au client

// 1. Correction pour /evenements (Redirige vers l'accueil ou affiche la vue)
/*app.get('/evenements', (req, res) => {
    const sql = 'SELECT * FROM evenement WHERE date_event >= CURDATE() ORDER BY date_event ASC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('evenements', { evenements: results });
    });
});*/
/*app.get('/evenements', (req, res) => {
    const editId = req.query.edit; // On récupère l'ID depuis l'URL (ex: /evenements?edit=2)
    const sqlList = 'SELECT * FROM evenement WHERE date_event >= CURDATE() ORDER BY date_event ASC';
    
    db.query(sqlList, (err, results) => {
        if (err) throw err;
        
        if (editId) {
            const sqlEdit = 'SELECT * FROM evenement WHERE id = ?';
            db.query(sqlEdit, [editId], (err, editResult) => {
                if (err) throw err;
                res.render('evenements', { 
                    evenements: results, 
                    eventToEdit: editResult[0] // On envoie l'événement à modifier
                });
            });
        } else {
            res.render('evenements', { 
                evenements: results, 
                eventToEdit: null // Mode création normale
            });
        }
    });
});*/
/*app.get('/evenements', (req, res) => {
    const editId = req.query.edit;
    const search = req.query.search || ''; // Gestion de la recherche

    // Requêtes pour les checklists
    const sqlPrestations = "SELECT * FROM prestation";
    const sqlEquipe = "SELECT id, nom FROM agence";
    const sqlList = "SELECT * FROM evenement WHERE titre LIKE ? ORDER BY date_event ASC";

    db.query(sqlPrestations, (err, prestations) => {
        db.query(sqlEquipe, (err, membres) => {
            db.query(sqlList, [`%${search}%`], (err, results) => {
                if (err) throw err;

                if (editId) {
                    db.query('SELECT * FROM evenement WHERE id = ?', [editId], (err, editResult) => {
                        res.render('evenements', { 
                            evenements: results, 
                            eventToEdit: editResult[0],
                            prestations: prestations,
                            membres: membres,
                            search: search
                        });
                    });
                } else {
                    res.render('evenements', { 
                        evenements: results, 
                        eventToEdit: null,
                        prestations: prestations,
                        membres: membres,
                        search: search
                    });
                }
            });
        });
    });
});
*/
/*app.get('/evenements', (req, res) => {
    const editId = req.query.edit;
    const search = req.query.search || '';

    const sqlPrestations = "SELECT * FROM prestation";
    // CORRECTION : On ajoute JOIN roles pour avoir nom_role
    const sqlEquipe = "SELECT a.id, a.nom, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";
    const sqlList = "SELECT * FROM evenement WHERE titre LIKE ? ORDER BY date_event ASC";

    db.query(sqlPrestations, (err, prestations) => {
        db.query(sqlEquipe, (err, membres) => {
            db.query(sqlList, [`%${search}%`], (err, results) => {
                if (err) throw err;
                res.render('evenements', { 
                    evenements: results, 
                    eventToEdit: null, // Simplifié pour l'exemple
                    prestations: prestations,
                    membres: membres, // Contient maintenant nom_role
                    search: search
                });
            });
        });
    });
});*/
/*app.get('/evenements', (req, res) => {
    const search = req.query.search || '';

    const sqlPrestations = "SELECT * FROM prestation";
    // Jointure pour afficher "Photographe" au lieu de "10"
    const sqlEquipe = "SELECT a.id, a.nom, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";
    const sqlList = "SELECT * FROM evenement WHERE titre LIKE ? ORDER BY date_event ASC";

    db.query(sqlPrestations, (err, prestations) => {
        if (err) return res.status(500).send(err.message);

        db.query(sqlEquipe, (err, membres) => {
            if (err) return res.status(500).send(err.message);

            db.query(sqlList, [`%${search}%`], (err, events) => {
                if (err) return res.status(500).send(err.message);

                res.render('evenements', { 
                    evenements: events, 
                    prestations: prestations,
                    membres: membres, 
                    search: search,
                    eventToEdit: null 
                });
            });
        });
    });
});
app.get('/evenements', (req, res) => {
    const editId = req.query.edit;
    const fromResId = req.query.resId; // ID de la réservation cliente
    const search = req.query.search || '';

    const sqlPrestations = "SELECT * FROM prestation";
    const sqlEquipe = "SELECT a.id, a.nom, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";
    const sqlList = "SELECT * FROM evenement WHERE titre LIKE ? ORDER BY date_event ASC";

    db.query(`${sqlPrestations}; ${sqlEquipe}; ${sqlList}`, [`%${search}%`], (err, results) => {
        if (err) throw err;

        let eventToEdit = null;

        // CAS 1 : Modification d'un événement existant
        if (editId) {
            eventToEdit = results[2].find(e => e.id == editId);
        } 
        // CAS 2 : Pré-remplissage depuis une réservation cliente (image_11ea98.png)
        else if (fromResId) {
            // On peut chercher les infos dans la vue du dashboard ou la table client
            const sqlRes = "SELECT * FROM vue_tableau_bord WHERE id = ?";
            db.query(sqlRes, [fromResId], (err, resData) => {
                if (resData.length > 0) {
                    const r = resData[0];
                    eventToEdit = {
                        titre: r.nom_client, // Le nom du client devient le titre par défaut
                        date_event: r.date_event,
                        heure_event: r.heure_event || "12:00",
                        lieu_event: r.lieu_event,
                        id_prestation: r.id_prestation, // Les prestations choisies par le client
                        resId: fromResId // On garde l'ID pour valider plus tard
                    };
                }
                renderPage(res, results, eventToEdit, search);
            });
            return;
        }

        renderPage(res, results, eventToEdit, search);
    });
});*/
app.get('/evenements', (req, res) => {
    const editId = req.query.edit;
    const fromResId = req.query.resId; 
    const search = req.query.search || '';

    const sqlPrestations = "SELECT * FROM prestation";
    const sqlEquipe = "SELECT a.id, a.nom, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";
    
    // NOUVELLE REQUÊTE : On récupère l'email du client lié
    const sqlList = `
        SELECT e.*, c.email AS email_client 
        FROM evenement e 
        LEFT JOIN client c ON e.id_client = c.id 
        WHERE e.titre LIKE ? 
        ORDER BY e.date_event ASC
    `;

    db.query(`${sqlPrestations}; ${sqlEquipe}; ${sqlList}`, [`%${search}%`], (err, results) => {
        if (err) throw err;

        let eventToEdit = null;

        if (editId) {
            eventToEdit = results[2].find(e => e.id == editId);
        } 
        else if (fromResId) {
            const sqlRes = "SELECT * FROM vue_tableau_bord WHERE id = ?";
            db.query(sqlRes, [fromResId], (err, resData) => {
                if (err) throw err; // Toujours vérifier l'erreur ici aussi
                
                if (resData.length > 0) {
                    const r = resData[0];
                    eventToEdit = {
                        // Ici, on peut mettre un titre générique ou laisser le nom du client
                        // mais on verra maintenant la différence dans le dashboard
                        titre: `Projet de ${r.nom_client}`, 
                        date_event: r.date_event,
                        heure_event: r.heure_event || "12:00",
                        lieu_event: r.lieu_event,
                        id_prestation: r.id_prestation,
                        resId: fromResId
                    };
                }
                renderPage(res, results, eventToEdit, search);
            });
            return;
        }

        renderPage(res, results, eventToEdit, search);
    });
});

function renderPage(res, results, eventToEdit, search) {
    res.render('evenements', { 
        prestations: results[0], 
        membres: results[1], 
        evenements: results[2], 
        eventToEdit, 
        search 
    });
}
// Route pour enregistrer la modification (UPDATE)
app.post('/evenements/update/:id', (req, res) => {
    const { titre, date_event, heure_event, lieu_event } = req.body;
    const sql = "UPDATE evenement SET titre = ?, date_event = ?, heure_event = ?, lieu_event = ? WHERE id = ?";
    
    db.query(sql, [titre, date_event, heure_event, lieu_event, req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/evenements');
    });
});

// 2. Correction pour Ajouter un membre
/*app.post('/admin/ajouter-membre', (req, res) => {
    const { nom, email, password, id_role } = req.body;
    const sql = "INSERT INTO agence (nom, email, mot_de_passe, id_role) VALUES (?, ?, ?, ?)";
    db.query(sql, [nom, email, password, id_role], (err) => {
        if (err) throw err;
        res.redirect('/equipe');
    });
});*/
app.post('/admin/ajouter-membre', (req, res) => {
    const { nom, email, password, id_role } = req.body;
    const sql = "INSERT INTO agence (nom, email, mot_de_passe, id_role) VALUES (?, ?, ?, ?)";
    db.query(sql, [nom, email, password, id_role], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/admin/equipes'); // On utilise la même redirection ici
    });
});
app.get('/admin/equipes', (req, res) => {
    // 1. On récupère les rôles pour le <select>
    const sqlRoles = "SELECT * FROM roles";
    // 2. On récupère les membres avec le nom de leur rôle (JOIN)
    const sqlMembres = "SELECT a.*, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";

    db.query(sqlRoles, (err, roles) => {
        if (err) return res.status(500).send(err.message);
        
        db.query(sqlMembres, (err, membres) => {
            if (err) return res.status(500).send(err.message);
            
            // On envoie les deux résultats au fichier EJS
            res.render('equipe', { roles: roles, membres: membres });
        });
    });
});
// 3. Correction pour Ajouter une Prestation
app.post('/admin/prestation', (req, res) => {
    const { nom_prestation } = req.body;
    const sql = 'INSERT INTO prestation (nom_prestation) VALUES (?)';
    db.query(sql, [nom_prestation], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// 4. Correction pour Ajouter un Fournisseur
app.post('/admin/fournisseur', (req, res) => {
    const { nom_societe } = req.body;
    const sql = 'INSERT INTO fournisseur (nom_societe) VALUES (?)';
    db.query(sql, [nom_societe], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});
// --- GESTION ÉVÉNEMENTS (CRUD & DÉTAILS) ---

/*app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event } = req.body;
    const sql = 'INSERT INTO evenement (titre, date_event, heure_event, lieu_event) VALUES (?, ?, ?, ?)';
    db.query(sql, [titre, date_event, heure_event, lieu_event], (err) => {
        if (err) throw err;
        res.redirect('/'); 
    });
});
*/
/*app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event, prestations, equipe } = req.body;
    
    // On transforme les tableaux en chaînes de caractères "Presta1, Presta2"
    const prestationsStr = Array.isArray(prestations) ? prestations.join(', ') : prestations;
    const equipeStr = Array.isArray(equipe) ? equipe.join(', ') : equipe;

    const sql = 'INSERT INTO evenement (titre, date_event, heure_event, lieu_event, id_prestation) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [titre, date_event, heure_event, lieu_event, prestationsStr], (err) => {
        if (err) throw err;
        res.redirect('/evenements'); 
    });
});*/
/*app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event, prestations, equipe } = req.body;
    
    // Transformation des tableaux en chaînes pour le stockage VARCHAR/TEXT
    const prestationsStr = Array.isArray(prestations) ? prestations.join(', ') : prestations;
    const equipeStr = Array.isArray(equipe) ? equipe.join(', ') : equipe;

    // CORRECTION : Ajout de la colonne 'equipe' dans le INSERT
    const sql = 'INSERT INTO evenement (titre, date_event, heure_event, lieu_event, id_prestation, equipe) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [titre, date_event, heure_event, lieu_event, prestationsStr, equipeStr], (err) => {
        if (err) {
            console.error("Erreur d'insertion :", err.message);
            return res.status(500).send("Erreur SQL");
        }
        res.redirect('/evenements'); 
    });
});
app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event, prestations, equipe } = req.body;
    
    // Conversion des sélections multiples en chaînes de caractères
    const prestationsStr = Array.isArray(prestations) ? prestations.join(', ') : (prestations || "");
    const equipeStr = Array.isArray(equipe) ? equipe.join(', ') : (equipe || "");

    // Requête SQL exacte correspondant à votre structure phpMyAdmin
    const sql = 'INSERT INTO evenement (titre, date_event, lieu_event, id_prestation, equipe, heure_event) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [titre, date_event, lieu_event, prestationsStr, equipeStr, heure_event], (err) => {
        if (err) {
            console.error("Erreur d'insertion :", err.message);
            return res.status(500).send("Erreur lors de l'enregistrement : " + err.message);
        }
        res.redirect('/evenements'); 
    });
});app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event, prestations, equipe } = req.body;
    
    // Conversion sécurisée des tableaux en texte
    const prestationsStr = Array.isArray(prestations) ? prestations.join(', ') : (prestations || "");
    const equipeStr = Array.isArray(equipe) ? equipe.join(', ') : (equipe || "");

    // CRITIQUE : Vérifiez bien l'orthographe de "equipe" ici
    const sql = "INSERT INTO evenement (titre, date_event, heure_event, lieu_event, id_prestation, equipe) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [titre, date_event, heure_event, lieu_event, prestationsStr, equipeStr], (err) => {
        if (err) {
            console.error("❌ Erreur d'insertion :", err.message); // Si l'erreur persiste, elle s'affichera ici
            return res.status(500).send("Erreur SQL : " + err.message);
        }
        res.redirect('/evenements'); 
    });
});*/
app.post('/admin/evenement', (req, res) => {
    const { titre, date_event, heure_event, lieu_event, prestations, equipe, resId } = req.body;
    
    const prestationsStr = Array.isArray(prestations) ? prestations.join(', ') : (prestations || "");
    const equipeStr = Array.isArray(equipe) ? equipe.join(', ') : (equipe || "");

    const sqlInsert = "INSERT INTO evenement (titre, date_event, heure_event, lieu_event, id_prestation, equipe) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sqlInsert, [titre, date_event, heure_event, lieu_event, prestationsStr, equipeStr], (err) => {
        if (err) return res.status(500).send(err.message);

        // Si l'événement vient d'une réservation client, on valide le statut
        if (resId) {
            const sqlUpdateStatus = "UPDATE client SET statut = 'valide' WHERE id = ?";
            db.query(sqlUpdateStatus, [resId], (err) => {
                if (err) console.error("Erreur de mise à jour du statut");
                res.redirect('/evenements');
            });
        } else {
            res.redirect('/evenements');
        }
    });
});
/*app.get('/evenements/details/:id', (req, res) => {
    const sqlEv = "SELECT * FROM evenement WHERE id = ?";
    const sqlMat = "SELECT r.*, m.nom_article FROM reservation r JOIN materiel m ON r.id_materiel = m.id WHERE id_evenement = ?";
    db.query(`${sqlEv}; ${sqlMat}`, [req.params.id, req.params.id], (err, results) => {
        if (err) throw err;
        res.render('details-evenement', { event: results[0][0], materiels: results[1] });
    });
});
app.get('/evenements/details/:id', (req, res) => {
    const sqlEv = "SELECT * FROM evenement WHERE id = ?";
    const sqlMat = "SELECT r.*, m.nom_article FROM reservation r JOIN materiel m ON r.id_materiel = m.id WHERE id_evenement = ?";
    
    db.query(`${sqlEv}; ${sqlMat}`, [req.params.id, req.params.id], (err, results) => {
        if (err) throw err;

        const event = results[0][0];
        const materiels = results[1];

        // CRITIQUE : Créer la variable membresAssignes demandée par EJS
        // On transforme la chaîne "Princia, Jean" en tableau ["Princia", "Jean"]
        let membresAssignes = [];
        if (event && event.equipe) {
            membresAssignes = event.equipe.split(', ');
        }

        res.render('details-evenement', { 
            event: event, 
            materiels: materiels,
            membresAssignes: membresAssignes // On envoie enfin la variable !
        });
    });
});
*/app.get('/evenements/details/:id', (req, res) => {
    const sqlEv = "SELECT * FROM evenement WHERE id = ?";
    const sqlMat = "SELECT r.*, m.nom_article FROM reservation r JOIN materiel m ON r.id_materiel = m.id WHERE id_evenement = ?";
    
    db.query(`${sqlEv}; ${sqlMat}`, [req.params.id, req.params.id], (err, results) => {
        if (err) throw err;

        const event = results[0][0];
        
        // On transforme la chaîne "Princia, Jean" en tableau ["Princia", "Jean"]
        // Le .filter(n => n) permet d'éviter les éléments vides si la colonne est vide
        let membresAssignes = [];
        if (event && event.equipe) {
            membresAssignes = event.equipe.split(', ').filter(nom => nom.trim() !== "");
        }

        res.render('details-evenement', { 
            event: event, 
            materiels: results[1],
            membresAssignes: membresAssignes 
        });
    });
});
app.get('/admin/delete-event/:id', (req, res) => {
    db.query('DELETE FROM evenement WHERE id = ?', [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/');
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
app.post('/admin/update-materiel/:id', (req, res) => {
    const { nom_article, stock_agence, id_prestation } = req.body;
    const sql = "UPDATE materiel SET nom_article=?, stock_agence=?, id_prestation=? WHERE id=?";
    
    db.query(sql, [nom_article, stock_agence, id_prestation, req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/inventaire');
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
app.get('/archives', (req, res) => {
    const sql = 'SELECT * FROM evenement WHERE date_event < CURDATE() ORDER BY date_event DESC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('archives', { evenements: results });
    });
});

// --- RÉSERVATIONS & SORTIES ---

app.post('/reserver-groupe', (req, res) => {
    const { id_event, materiels, quantites, id_fournisseur } = req.body;
    if (!materiels || materiels.length === 0) return res.redirect('/');

    let completed = 0;
    const userId = req.session.user.id;

    materiels.forEach((id_mat, index) => {
        const voulu = parseInt(quantites[index]);
        if (isNaN(voulu) || voulu <= 0) { completed++; return; }

        db.query('SELECT stock_agence FROM materiel WHERE id = ?', [id_mat], (err, results) => {
            const stockDispo = results[0].stock_agence;
            let qte_ag = voulu > stockDispo ? stockDispo : voulu;
            let qte_f = voulu > stockDispo ? (voulu - stockDispo) : 0;

            const sqlIns = 'INSERT INTO reservation (id_evenement, id_materiel, id_fournisseur, quantite_voulue, qte_agence, qte_fournisseur, statut) VALUES (?,?,?,?,?,?, "en_cours")';
            const sqlUpd = 'UPDATE materiel SET stock_agence = stock_agence - ? WHERE id = ?';
            const sqlLog = 'INSERT INTO historique_mouvement (id_utilisateur, id_materiel, type_action, quantite) VALUES (?, ?, "sortie", ?)';

            db.query(sqlIns, [id_event, id_mat, id_fournisseur || null, voulu, qte_ag, qte_f], () => {
                db.query(sqlUpd, [qte_ag, id_mat], () => {
                    db.query(sqlLog, [userId, id_mat, qte_ag], () => {
                        completed++;
                        if (completed === materiels.length) res.redirect('/');
                    });
                });
            });
        });
    });
});


app.get('/evenement/pdf/:id', async (req, res) => {
    try {
        const page = await browser.newPage();
        
        // On redirige vers la route de détails qu'on a déjà créée
        // On utilise l'URL complète pour que Puppeteer y accède
        const url = `http://localhost:4000/evenements/details/${req.params.id}`;
        
        // On passe les cookies de session pour que Puppeteer soit "connecté"
        const sessionCookie = req.headers.cookie;
        if (sessionCookie) {
            const cookies = sessionCookie.split(';').map(pair => {
                const [name, value] = pair.trim().split('=');
                return { name, value, domain: 'localhost' };
            });
            await page.setCookie(...cookies);
        }

        await page.goto(url, { waitUntil: 'networkidle0' });
        
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        res.contentType("application/pdf");
        res.send(pdf);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la génération du PDF");
    }
});
// --- RETOURS & HISTORIQUE ---

/*app.post('/admin/retour-materiel', (req, res) => {
    const { id_reservation, id_materiel, qte_agence } = req.body;
    const userId = req.session.user.id; 

    db.query("UPDATE materiel SET stock_agence = stock_agence + ? WHERE id = ?", [qte_agence, id_materiel], (err) => {
        db.query("UPDATE reservation SET statut = 'rendu' WHERE id = ?", [id_reservation], (err) => {
            const sqlLog = "INSERT INTO historique_mouvement (id_utilisateur, id_materiel, type_action, quantite, date_action) VALUES (?, ?, 'retour', ?, NOW())";
            db.query(sqlLog, [userId, id_materiel, qte_agence], (err) => {
                res.redirect('/historique');
            });
        });
    });
});
*/
app.post('/admin/retour-materiel', (req, res) => {
    const { id_reservation, id_materiel, qte_agence } = req.body;
    const userId = req.session.user.id; 

    // On remet le stock à jour en utilisant le BON nom de colonne : stock_agence
    db.query("UPDATE materiel SET stock_agence = stock_agence + ? WHERE id = ?", [qte_agence, id_materiel], (err) => {
        if (err) throw err;

        // On marque la réservation comme rendue
        db.query("UPDATE reservation SET statut = 'rendu' WHERE id = ?", [id_reservation], (err) => {
            if (err) throw err;

            // On enregistre le mouvement dans l'historique
            const sqlLog = "INSERT INTO historique_mouvement (id_utilisateur, id_materiel, type_action, quantite, date_action) VALUES (?, ?, 'retour', ?, NOW())";
            db.query(sqlLog, [userId, id_materiel, qte_agence], (err) => {
                if (err) throw err;
                res.redirect('/'); // Revient sur la page de détails
            });
        });
    });
});
app.get('/historique', (req, res) => {
    const sql = `
        SELECT h.*, a.nom AS nom_utilisateur, m.nom_article, r.nom_role
        FROM historique_mouvement h
        JOIN agence a ON h.id_utilisateur = a.id
        JOIN roles r ON a.id_role = r.id
        JOIN materiel m ON h.id_materiel = m.id
        ORDER BY h.date_action DESC`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('historique', { logs: results });
    });
});

// --- INVENTAIRE & MATÉRIEL ---

app.get('/inventaire', (req, res) => {
    const query = "SELECT m.*, p.nom_prestation FROM materiel m LEFT JOIN prestation p ON m.id_prestation = p.id";
    db.query(query, (err, results) => {
        if (err) throw err;
        const inventaireGroupe = results.reduce((acc, item) => {
            const cat = item.nom_prestation || 'Non classé';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});
        res.render('inventaire', { groupes: inventaireGroupe });
    });
});

app.post('/admin/materiel', (req, res) => {
    const { nom_article, stock_agence, id_prestation } = req.body; 
    const sql = 'INSERT INTO materiel (nom_article, stock_agence, stock_total, id_prestation) VALUES (?, ?, ?, ?)';
    db.query(sql, [nom_article, stock_agence, stock_agence, id_prestation], (err) => {
        if (err) throw err;
        res.redirect('/inventaire'); 
    });
});

// --- ÉQUIPE ---
app.get('/equipe', (req, res) => {
    const sqlMembres = "SELECT a.*, r.nom_role FROM agence a JOIN roles r ON a.id_role = r.id";
    const sqlRoles = "SELECT * FROM roles";
    db.query(`${sqlMembres}; ${sqlRoles}`, (err, results) => {
        if (err) throw err;
        res.render('equipe', { membres: results[0], roles: results[1] });
    });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
//app.listen(4000, () => console.log('🚀 Serveur lancé sur http://localhost:4000'));
/*const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});*/