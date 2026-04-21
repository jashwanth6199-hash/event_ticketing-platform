<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = '127.0.0.1';
$db = 'eventhub_db';
$user = 'root'; // Default XAMPP username
$pass = '';     // Default XAMPP password is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_events') {
        $stmt = $pdo->query("SELECT * FROM events ORDER BY date ASC");
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure price & capacity are output as numbers for the frontend math
        foreach($events as &$e) {
            $e['price'] = (float)$e['price'];
            $e['capacity'] = (int)$e['capacity'];
            $e['ticketsSold'] = (int)$e['ticketsSold'];
        }
        
        echo json_encode($events);
        exit();
    } elseif ($action === 'get_bookings') {
        $userId = $_GET['userId'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE userId = ? ORDER BY booking_date DESC");
        $stmt->execute([$userId]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($bookings);
        exit();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($action === 'create_event') {
        $stmt = $pdo->prepare("INSERT INTO events (id, title, date, location, description, price, capacity, ticketsSold, image, organizerId) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)");
        $id = 'evt-' . time();
        $success = $stmt->execute([
            $id,
            $data['title'],
            $data['date'],
            $data['location'],
            $data['description'],
            $data['price'],
            $data['capacity'],
            $data['image'],
            $data['organizerId']
        ]);
        echo json_encode(['success' => $success, 'id' => $id]);
        exit();
    } elseif ($action === 'book_ticket') {
        // simple transaction to prevent overselling
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("SELECT capacity, ticketsSold, price FROM events WHERE id = ? FOR UPDATE");
            $stmt->execute([$data['eventId']]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($event['capacity'] - $event['ticketsSold'] >= $data['quantity']) {
                $update = $pdo->prepare("UPDATE events SET ticketsSold = ticketsSold + ? WHERE id = ?");
                $update->execute([$data['quantity'], $data['eventId']]);
                
                $bId = 'bkg-' . time() . rand(100, 999);
                $bStmt = $pdo->prepare("INSERT INTO bookings (id, eventId, userId, quantity, totalPrice) VALUES (?, ?, ?, ?, ?)");
                $totalPrice = $event['price'] * $data['quantity'];
                
                $bStmt->execute([
                    $bId,
                    $data['eventId'],
                    $data['userId'],
                    $data['quantity'],
                    $totalPrice
                ]);
                $pdo->commit();
                echo json_encode(['success' => true, 'bookingId' => $bId]);
            } else {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'error' => 'Not enough available tickets']);
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit();
    }
}

echo json_encode(['error' => 'Invalid action']);
?>
