-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 30 avr. 2026 à 13:59
-- Version du serveur : 10.4.27-MariaDB
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `agence_event`
--

-- --------------------------------------------------------

--
-- Structure de la table `agence`
--

CREATE TABLE `agence` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mot_de_passe` varchar(255) DEFAULT NULL,
  `id_role` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `agence`
--

INSERT INTO `agence` (`id`, `nom`, `email`, `mot_de_passe`, `id_role`) VALUES
(1, 'Princia', 'admin@agence.com', 'admin123', 1),
(2, 'essai', 'essai@agence.com', '123456', 2);

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

CREATE TABLE `client` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`id`, `nom`) VALUES
(1, 'DDF'),
(2, 'Client Test');

-- --------------------------------------------------------

--
-- Structure de la table `evenement`
--

CREATE TABLE `evenement` (
  `id` int(11) NOT NULL,
  `titre` varchar(100) DEFAULT NULL,
  `id_client` int(11) DEFAULT NULL,
  `date_event` date DEFAULT NULL,
  `heure_event` time DEFAULT NULL,
  `lieu_event` varchar(255) DEFAULT NULL,
  `date_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `evenement`
--

INSERT INTO `evenement` (`id`, `titre`, `id_client`, `date_event`, `heure_event`, `lieu_event`, `date_fin`) VALUES
(6, 'essai', NULL, '2026-05-10', '10:10:00', 'ada', NULL),
(7, 'tester ', NULL, '2026-05-01', '16:00:00', 'ggggggggg', NULL),
(8, 'guyg', NULL, '2026-05-08', '16:50:00', 'hiuh', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `fournisseur`
--

CREATE TABLE `fournisseur` (
  `id` int(11) NOT NULL,
  `nom_societe` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `fournisseur`
--

INSERT INTO `fournisseur` (`id`, `nom_societe`) VALUES
(1, 'Location Pro Madagascar'),
(2, 'hhhh');

-- --------------------------------------------------------

--
-- Structure de la table `historique_mouvement`
--

CREATE TABLE `historique_mouvement` (
  `id` int(11) NOT NULL,
  `id_utilisateur` int(11) DEFAULT NULL,
  `id_materiel` int(11) DEFAULT NULL,
  `type_action` enum('sortie','retour') DEFAULT NULL,
  `quantite` int(11) DEFAULT NULL,
  `date_action` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `historique_mouvement`
--

INSERT INTO `historique_mouvement` (`id`, `id_utilisateur`, `id_materiel`, `type_action`, `quantite`, `date_action`) VALUES
(1, 1, 48, 'retour', 1, '2026-04-30 11:36:15'),
(2, 1, 48, 'retour', 1, '2026-04-30 11:38:32'),
(3, 1, 48, 'retour', 1, '2026-04-30 11:39:01'),
(4, 1, 48, 'retour', 1, '2026-04-30 11:43:06'),
(5, 1, 49, 'retour', 1, '2026-04-30 11:44:38'),
(6, 1, 28, 'retour', 1, '2026-04-30 11:45:54'),
(7, 1, 35, 'retour', 1, '2026-04-30 11:56:51'),
(8, 2, 49, 'sortie', 1, '2026-04-30 12:06:32'),
(9, 1, 49, 'retour', 1, '2026-04-30 12:06:36'),
(10, 1, 49, 'retour', 1, '2026-04-30 12:06:50');

-- --------------------------------------------------------

--
-- Structure de la table `materiel`
--

CREATE TABLE `materiel` (
  `id` int(11) NOT NULL,
  `nom_article` varchar(100) DEFAULT NULL,
  `stock_agence` int(11) DEFAULT NULL,
  `id_prestation` int(11) DEFAULT NULL,
  `stock_total` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `materiel`
--

INSERT INTO `materiel` (`id`, `nom_article`, `stock_agence`, `id_prestation`, `stock_total`) VALUES
(19, 'Black Magik 6K', 0, 8, 1),
(20, 'Black Magic 4K', 0, 8, 1),
(21, 'Black Magic URSA 12K', 0, 8, 1),
(22, 'Lumix S1H', 1, 8, 1),
(23, 'Nikon 26', 2, 8, 2),
(24, 'Nikon 750', 2, 8, 2),
(25, 'canon 70 - 200 ', 1, 8, 1),
(26, 'canon 24 - 70 mm ', 1, 8, 1),
(27, 'canon 75mm ', 1, 8, 1),
(28, 'canon 17 - 40 mm ', 1, 8, 1),
(29, 'Carl zeiss 50 mm', 1, 8, 1),
(30, 'Nokton 17 mm', 1, 8, 1),
(31, 'Nikkor 85 mm ', 1, 8, 1),
(32, 'Nikkor 35 mm ', 1, 8, 1),
(33, 'Nikkor 28 mm ', 1, 8, 1),
(34, 'Sigma 70 - 200', 1, 8, 1),
(35, 'Bague objectif M4/3 Nikkor ', 1, 8, 1),
(36, 'Bague objectif M4/3 Canon', 1, 8, 1),
(37, 'Table ATEM switcher', 1, 8, 1),
(38, 'HDMI MF', 1, 8, 1),
(39, 'Zoom M6 ', 1, 8, 1),
(40, 'Micro cravatte mm', 1, 8, 1),
(49, 'tapitra', 22, 9, 22);

-- --------------------------------------------------------

--
-- Structure de la table `prestation`
--

CREATE TABLE `prestation` (
  `id` int(11) NOT NULL,
  `nom_prestation` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `prestation`
--

INSERT INTO `prestation` (`id`, `nom_prestation`) VALUES
(8, 'Vidéo'),
(9, 'test'),
(10, 'test');

-- --------------------------------------------------------

--
-- Structure de la table `reservation`
--

CREATE TABLE `reservation` (
  `id` int(11) NOT NULL,
  `id_evenement` int(11) DEFAULT NULL,
  `id_materiel` int(11) DEFAULT NULL,
  `id_fournisseur` int(11) DEFAULT NULL,
  `id_utilisateur` int(11) DEFAULT NULL,
  `quantite_voulue` int(11) DEFAULT NULL,
  `qte_agence` int(11) DEFAULT NULL,
  `qte_fournisseur` int(11) DEFAULT NULL,
  `statut` enum('planifie','en_cours','rendu') DEFAULT 'planifie',
  `date_reservation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reservation`
--

INSERT INTO `reservation` (`id`, `id_evenement`, `id_materiel`, `id_fournisseur`, `id_utilisateur`, `quantite_voulue`, `qte_agence`, `qte_fournisseur`, `statut`, `date_reservation`) VALUES
(1, 6, 49, NULL, NULL, 1, 1, 0, 'rendu', '2026-04-30 11:44:35'),
(2, 8, 28, NULL, NULL, 1, 1, 0, 'rendu', '2026-04-30 11:45:48'),
(3, 8, 35, NULL, NULL, 1, 1, 0, 'rendu', '2026-04-30 11:45:48'),
(4, 6, 49, NULL, NULL, 1, 1, 0, 'rendu', '2026-04-30 11:57:18'),
(5, 6, 49, NULL, NULL, 1, 1, 0, 'rendu', '2026-04-30 12:06:31');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nom_role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `nom_role`) VALUES
(1, 'Administrateur'),
(4, 'Logistique'),
(2, 'Photographe'),
(3, 'Régisseur');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_tableau_bord`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_tableau_bord` (
`id_res` int(11)
,`event_nom` varchar(100)
,`nom_article` varchar(100)
,`quantite_voulue` int(11)
,`qte_agence` int(11)
,`qte_fournisseur` int(11)
,`fournisseur_nom` varchar(100)
,`statut` enum('planifie','en_cours','rendu')
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_tableau_bord`
--
DROP TABLE IF EXISTS `vue_tableau_bord`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_tableau_bord`  AS SELECT `r`.`id` AS `id_res`, `e`.`titre` AS `event_nom`, `m`.`nom_article` AS `nom_article`, `r`.`quantite_voulue` AS `quantite_voulue`, `r`.`qte_agence` AS `qte_agence`, `r`.`qte_fournisseur` AS `qte_fournisseur`, `f`.`nom_societe` AS `fournisseur_nom`, `r`.`statut` AS `statut` FROM (((`reservation` `r` join `evenement` `e` on(`r`.`id_evenement` = `e`.`id`)) join `materiel` `m` on(`r`.`id_materiel` = `m`.`id`)) left join `fournisseur` `f` on(`r`.`id_fournisseur` = `f`.`id`))  ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `agence`
--
ALTER TABLE `agence`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_role` (`id_role`);

--
-- Index pour la table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_client` (`id_client`);

--
-- Index pour la table `fournisseur`
--
ALTER TABLE `fournisseur`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `historique_mouvement`
--
ALTER TABLE `historique_mouvement`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `materiel`
--
ALTER TABLE `materiel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_prestation_materiel` (`id_prestation`);

--
-- Index pour la table `prestation`
--
ALTER TABLE `prestation`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_evenement` (`id_evenement`),
  ADD KEY `id_materiel` (`id_materiel`),
  ADD KEY `id_fournisseur` (`id_fournisseur`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom_role` (`nom_role`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `agence`
--
ALTER TABLE `agence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `evenement`
--
ALTER TABLE `evenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `fournisseur`
--
ALTER TABLE `fournisseur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `historique_mouvement`
--
ALTER TABLE `historique_mouvement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `materiel`
--
ALTER TABLE `materiel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT pour la table `prestation`
--
ALTER TABLE `prestation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `agence`
--
ALTER TABLE `agence`
  ADD CONSTRAINT `agence_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`);

--
-- Contraintes pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD CONSTRAINT `evenement_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `client` (`id`);

--
-- Contraintes pour la table `materiel`
--
ALTER TABLE `materiel`
  ADD CONSTRAINT `fk_prestation` FOREIGN KEY (`id_prestation`) REFERENCES `prestation` (`id`),
  ADD CONSTRAINT `fk_prestation_materiel` FOREIGN KEY (`id_prestation`) REFERENCES `prestation` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_evenement`) REFERENCES `evenement` (`id`),
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_materiel`) REFERENCES `materiel` (`id`),
  ADD CONSTRAINT `reservation_ibfk_3` FOREIGN KEY (`id_fournisseur`) REFERENCES `fournisseur` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
