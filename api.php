<?php
    //api
    include "noncache.php";
    include "_db.php";

    session_start();
    
    $ret = ["error" => 1, "message" => "Errore generico"];  
    
    //check if the user is logged
    function checkSession() {
        if (!isset($_SESSION['name']) || !isset($_SESSION['email']) || !isset($_SESSION['id']) || !isset($_SESSION['isAdmin'])) {
            return ["error" => 1, "message" => "Utente non autenticato"];
        }else{
            return [
                "error" => 0, 
                "message" => "Utente autenticato",
                "id" => $_SESSION['id'],
                "name" => $_SESSION['name'],
                "email" => $_SESSION['email'],
                "isAdmin" => $_SESSION['isAdmin']
            ];
        }
    }

    try{
        $conn = new mysqli($db_hostname, $db_username, $db_password, $db_name);
        if($conn->connect_error){
            $ret = ["error" => 1, "message" => "Connection error"];
            return;
        }
        if(!isset($_GET["op"])){
            $ret = ["error" => 1, "message" => "Operation not set"];
        }else{
            switch($_GET["op"]){
                case "checkSession":
                    $ret = checkSession();
                    break;
                //login 
                case "login":{
                    if(!isset($_POST["usernameLog"]) || !isset($_POST["passwordLog"]) || !isset($_POST["emailLog"])){
                        $ret = ["error" => 1, "message" => "Username o password non impostati"];
                    }else{
                        $username = $_POST["usernameLog"];
                        $password = hash("sha256", $_POST["passwordLog"]);
                        $email = $_POST["emailLog"];
                        $q = $conn->prepare("SELECT * FROM user WHERE name = ? and password = ? and email = ?");
                        $q->bind_param("sss", $username, $password, $email);
                        $q->execute();
                        $result = $q->get_result();
                        if($result->num_rows > 0){
                            $row = $result->fetch_assoc();
                            $_SESSION['id'] = $row['id'];
                            $_SESSION['name'] = $row['name'];
                            $_SESSION['email'] = $row['email'];
                            $_SESSION['isAdmin']= $row['permissions'];
                            $ret = ["error" => 0, "message" => "Login effettuato con successo", "isAdmin" => $row['permissions']];
                        } else {
                            $ret = ["error" => 1, "message" => "Credenziali non valide"];
                        }
                        $q->close(); 
                    }
                    break;
                }
                //create a new user
                case "register":
                    if(!isset($_POST["usernameReg"]) || !isset($_POST["passwordReg"]) || !isset($_POST["emailReg"])) {
                        $ret = ["error" => 1, "message" => "Username o password non impostati"];
                    } else {
                        $username = $_POST["usernameReg"];
                        $password = hash("sha256", $_POST["passwordReg"]);
                        $email = $_POST["emailReg"];
                        // check if the email is already registered
                        $q = $conn->prepare("SELECT email FROM user WHERE name = ?");
                        $q->bind_param("s", $email);
                        $q->execute();
                        $result = $q->get_result();
                        if($result->num_rows > 0) {
                            $ret = ["error" => 1, "message" => "l'email è già registrata"];
                            $q->close();
                        } else {
                            // insert the new user
                            $q = $conn->prepare("INSERT INTO user (name, password, email) VALUES (?, ?, ?)");
                            $q->bind_param("sss", $username, $password, $email);
                            if($q->execute()) {
                                $ret = ["error" => 0, "message" => "Utente registrato con successo"];
                            } else {
                                $ret = ["error" => 1, "message" => "Errore durante la registrazione"];
                            }
                            $q->close();
                        }
                    }
                    break;
                //logout
                case "logout":
                    session_unset();
                    $ret = ["error" => 0, "message" => "Logout effettuato con successo"];
                    break;
                //make a reservation
                case "reservation":
                        $session = checkSession();
                        if ($session["error"] !== 0) {
                            $ret = ["error" => 1, "message" => "Devi effettuare il login per fare una prenotazione"];
                            break;
                        }
                        
                        if (!isset($_POST["phone"]) || !isset($_POST["people"]) || !isset($_POST["date"]) || !isset($_POST["allergies"]) || !isset($_POST["notes"])) {
                            $ret = ["error" => 1, "message" => "Error: missing parameters"];
                            break;
                        }
                        $phone = $_POST["phone"];
                        $people = (int)$_POST["people"]; 
                        $date = $_POST["date"];
                        $allergies = $_POST["allergies"];
                        $notes = $_POST["notes"];
                        $idUser = $session["id"];

                        // check if the date is available
                        $q = $conn->prepare("SELECT IFNULL(SUM(reservation.people), 0) AS total FROM reservation WHERE date = ?");
                        $q->bind_param("s", $date);
                        $q->execute();
                        $result = $q->get_result();
                        $row = $result->fetch_assoc();
                        $total = (int)$row["total"]; 
                        $max_capacity = 20;
                        $available_spots = $max_capacity - $total;

                        //check if there are enough spots available
                        if ($people > $available_spots) {
                            $ret = ["error" => 1, "message" => "Non sono disponibili più posti per la data selezionata"];
                            break;
                        }

                        //check if there are enough spots available
                        $q = $conn->prepare("SELECT * FROM reservation WHERE date = ?");
                        $q->bind_param("s", $date);
                        $q->execute();
                        $result = $q->get_result();
                        if($result->num_rows > 15) {
                            $ret = ["error" => 1, "message" => "Non ci sono più tavoli disponibili per la data selezionata"];
                            $q->close();
                            break;
                        }

                        //insert the reservation in the database
                        $q = $conn->prepare("INSERT INTO reservation (idUser, phone, people, date, allergies, notes) VALUES (?, ?, ?, ?, ?, ?)");
                        $q->bind_param("isssss", $idUser, $phone, $people, $date, $allergies, $notes);
                        
                        if ($q->execute()) {
                            $ret = ["error" => 0, "message" => "Reservation added successfully"];
                        } else {
                            $ret = ["error" => 1, "message" => "Error during reservation"];
                        }
                        $q->close();
                    break;
                //get all the users
                case "getUsers":
                    $session = checkSession();
                    if ($session["isAdmin"] !== 1) {
                        $ret = ["error" => 1, "message" => "Accesso non autorizzato"];
                        break;
                    }
                    $q = $conn->prepare("SELECT id, name, email, permissions FROM user");
                    $q->execute();
                    $result = $q->get_result();
                    $users = [];
                    while ($row = $result->fetch_assoc()) {
                        $users[] = $row;
                    }
                    $ret = ["error" => 0, "users" => $users];
                    break;
                //get all the reservations for the current user
                case "getReservations":
                    $session = checkSession();
                    if ($session["isAdmin"] !== 1) {
                        $ret = ["error" => 1, "message" => "Accesso non autorizzato"];
                        break;
                    }
                    $q = $conn->query("SELECT reservation.*, user.name FROM reservation LEFT JOIN user ON reservation.idUser = user.id 
                                            WHERE DATE(reservation.date) >= CURDATE() ORDER BY reservation.date ASC;");
                    $reservations = [];
                    while ($row = $q->fetch_assoc()) {
                        $reservations[] = $row;
                    }
                    $ret = ["error" => 0, "reservations" => $reservations];
                    break;
                //delete one selected user (the admin user can delete only non-admin users) 
                case "deleteUser":
                    $session = checkSession();
                    if ($session["isAdmin"] !== 1) {
                        $ret = ["error" => 1, "message" => "Accesso non autorizzato"];
                        break;
                    }
                    if (!isset($_POST["userId"])) {
                        $ret = ["error" => 1, "message" => "ID utente non specificato"];
                        break;
                    }
                    $userId = $_POST["userId"];
                    $q = $conn->prepare("DELETE FROM user WHERE id = ?");
                    $q->bind_param("i", $userId);
                    if ($q->execute()) {
                        $ret = ["error" => 0, "message" => "Utente eliminato con successo"];
                    } else {
                        $ret = ["error" => 1, "message" => "Errore nell'eliminazione dell'utente"];
                    }
                    break;
                //delete one selected reservation
                case "deleteReservation":
                    $session = checkSession();
                    if ($session["isAdmin"] !== 1) {
                        $ret = ["error" => 1, "message" => "Accesso non autorizzato"];
                        break;
                    }
                    if (!isset($_POST["reservationId"])) {
                        $ret = ["error" => 1, "message" => "ID prenotazione non specificato"];
                        break;
                    }
                    $reservationId = $_POST["reservationId"];
                    $q = $conn->prepare("DELETE FROM reservation WHERE id = ?");
                    $q->bind_param("i", $reservationId);
                    if ($q->execute()) {
                        $ret = ["error" => 0, "message" => "Prenotazione eliminata con successo"];
                    } else {
                        $ret = ["error" => 1, "message" => "Errore nell'eliminazione della prenotazione"];
                    }
                    break;
                //email function
                /*case "send_mail":
                    $session = checkSession();
                    if ($session["error"] !== 0) {
                        $ret = ["error" => 1, "message" => "Accesso non autorizzato"];
                        break;
                    }
                    
                    if (!isset($_POST["phone"]) || !isset($_POST["people"]) || !isset($_POST["date"])) {
                        $ret = ["error" => 1, "message" => "Dati mancanti per l'invio dell'email"];
                        break;
                    }

                    $to = $session["email"];
                    $subject = "Conferma Prenotazione - La Perla Nera Restaurant";
                    
                    $message = "Gentile " . $session["name"] . ",\n\n";
                    $message .= "La tua prenotazione è stata confermata con i seguenti dettagli:\n\n";
                    $message .= "Data: " . $_POST["date"] . "\n";
                    $message .= "Numero di persone: " . $_POST["people"] . "\n";
                    $message .= "Telefono: " . $_POST["phone"] . "\n";
                    
                    if (!empty($_POST["allergies"])) {
                        $message .= "Allergie: " . $_POST["allergies"] . "\n";
                    }
                    
                    if (!empty($_POST["notes"])) {
                        $message .= "Note: " . $_POST["notes"] . "\n";
                    }
                    
                    $message .= "\nGrazie per aver scelto La Perla Nera Restaurant!\n";
                    
                    $headers = "From: La Perla Nera Restaurant <laperlanera8818@gmail.com>\r\n";
                    $headers .= "Reply-To: laperlanera8818@gmail.com\r\n";
                    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
                    $headers .= "MIME-Version: 1.0\r\n";
                    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
                    
                    if (mail($to, $subject, $message, $headers)) {
                        $ret = ["error" => 0, "message" => "Email inviata con successo"];
                    } else {
                        $ret = ["error" => 1, "message" => "Errore nell'invio dell'email"];
                    }
                    break;*/
                default:{
                    $ret = ["error" => 1, "message" => "Undefined operation"];
                }
            }
        }
    }catch(Exception $e){
        $ret = ["error" => 1, "message" => "Error: " . $e->getMessage()];
    }

    header('Content-Type: application/json');
    echo json_encode($ret);
    $conn->close();
?>