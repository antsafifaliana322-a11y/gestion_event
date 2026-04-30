-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 29 avr. 2026 à 19:38
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

--
-- Index pour les tables déchargées
--

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
-- AUTO_INCREMENT pour la table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

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
