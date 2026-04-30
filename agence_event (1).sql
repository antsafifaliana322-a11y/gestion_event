-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 30 avr. 2026 à 03:16
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
  `nom` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'test', NULL, '2026-05-10', '00:30:00', 'essai', NULL),
(2, 'essai', NULL, '2026-05-01', '15:22:00', 'test', NULL),
(3, 'a', NULL, '2026-05-22', '15:29:00', 'b', NULL),
(4, 'b', NULL, '2026-05-22', '15:00:00', 'd', NULL),
(5, 'i', NULL, '2026-04-29', '15:42:00', 'h', NULL);

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
-- Structure de la table `materiel`
--

CREATE TABLE `materiel` (
  `id` int(11) NOT NULL,
  `nom_article` varchar(100) DEFAULT NULL,
  `stock_agence` int(11) DEFAULT NULL,
  `id_prestation` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `materiel`
--

INSERT INTO `materiel` (`id`, `nom_article`, `stock_agence`, `id_prestation`) VALUES
(1, 'micro', 20, 1),
(8, 'microc', 50, 1);

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
(1, 'sonorisation'),
(2, 'eclairage'),
(3, 'photogr');

-- --------------------------------------------------------

--
-- Structure de la table `reservation`
--

CREATE TABLE `reservation` (
  `id` int(11) NOT NULL,
  `id_evenement` int(11) DEFAULT NULL,
  `id_materiel` int(11) DEFAULT NULL,
  `id_fournisseur` int(11) DEFAULT NULL,
  `quantite_voulue` int(11) DEFAULT NULL,
  `qte_agence` int(11) DEFAULT NULL,
  `qte_fournisseur` int(11) DEFAULT NULL,
  `statut` enum('planifie','en_cours','rendu') DEFAULT 'planifie'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `agence`
--
ALTER TABLE `agence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `evenement`
--
ALTER TABLE `evenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `fournisseur`
--
ALTER TABLE `fournisseur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `materiel`
--
ALTER TABLE `materiel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `prestation`
--
ALTER TABLE `prestation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

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
