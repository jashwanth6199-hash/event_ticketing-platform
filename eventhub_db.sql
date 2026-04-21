--
-- Database Schema for EventHub
-- Recommended for XAMPP (MySQL / MariaDB)
--

-- Create the database
CREATE DATABASE IF NOT EXISTS `eventhub_db`;
USE `eventhub_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('attendee','organizer') NOT NULL DEFAULT 'attendee',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `role`) VALUES
('org-admin', 'Event Organizer', 'organizer'),
('user1', 'John Doe', 'attendee');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `capacity` int(11) NOT NULL,
  `ticketsSold` int(11) NOT NULL DEFAULT 0,
  `image` varchar(500) DEFAULT NULL,
  `organizerId` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `date`, `location`, `description`, `price`, `capacity`, `ticketsSold`, `image`, `organizerId`) VALUES
('1', 'Global Tech Summit 2026', '2026-05-15', 'San Francisco, CA', 'Join industry leaders for a 3-day deep dive into AI, Web3, and the future of software.', 299.00, 500, 120, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop', 'org-admin'),
('2', 'Neon Nights Music Fest', '2026-06-20', 'Miami Beach, FL', 'Experience the ultimate electronic dance music festival with top DJs from around the world.', 150.00, 2000, 850, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop', 'org-admin'),
('3', 'Startup Pitch Showcase', '2026-04-10', 'New York, NY', 'Watch 20 promising startups pitch to top-tier investors. Great networking opportunity.', 0.00, 300, 290, 'https://images.unsplash.com/photo-1475721025505-23126915f0ea?w=800&auto=format&fit=crop', 'org-admin');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `eventId` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `totalPrice` decimal(10,2) NOT NULL,
  `booking_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizerId` (`organizerId`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eventId` (`eventId`),
  ADD KEY `userId` (`userId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_organizer` FOREIGN KEY (`organizerId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_event` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
