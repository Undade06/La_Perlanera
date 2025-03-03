# La Perla Nera - Sito Web Ristorante
Progetto di ristorante interattivo con HTML, CSS, JS per dinamiche utente e PHP per gestione prenotazioni e database.

## Installazione

1. Assicurati di avere **XAMPP** installato sul tuo computer.
2. Clona o scarica questo repository nella cartella `htdocs` di XAMPP:
   
   **Percorso:**
   ```
   C:/xampp/htdocs/ProgettoInfo
   ```

## Come accedere al sito

1. Avvia **XAMPP Control Panel**.
2. Attiva il servizio **Apache** cliccando su "Start".
3. Apri il tuo browser web preferito.
4. Inserisci uno dei seguenti URL:
   - [http://localhost/ProgettoInfo](http://localhost/ProgettoInfo)
   - [http://127.0.0.1/ProgettoInfo](http://127.0.0.1/ProgettoInfo)

## Configurazione del database

### 1. Creazione del database

- Dopo aver avviato **Apache**, apri **phpMyAdmin** tramite il browser andando su [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/).
- Clicca su **Nuovo** nella barra laterale sinistra per creare un nuovo database.
- Scegli un nome per il database (ad esempio, `ristorante_db`) e seleziona la codifica **utf8_general_ci**.
- Clicca su **Crea**.

### 2. Importazione del file SQL

- Nella schermata di **phpMyAdmin**, seleziona il database appena creato.
- Clicca sulla scheda **Importa**.
- Seleziona il file SQL del database che si trova nella cartella del progetto (ad esempio `ristorante.sql`).
- Clicca su **Esegui** per importare la struttura e i dati nel database.

### 3. Configurazione del file di connessione

- Verifica che le credenziali del database siano corrette nel file di configurazione del progetto (di solito in un file come `config.php` o `db.php`).
- Assicurati che i parametri di connessione siano configurati come segue:

```php
$host = 'localhost';
$username = 'root';
$password = '';  // Lascia vuoto se non hai impostato una password per MySQL
$dbname = 'ristorante_db';  // Nome del database creato
```

## Funzionalità non implementata

- La funzionalità di **invio e-mail** all'utente **non è stata ancora implementata**. Nonostante fosse prevista, per ragioni tecniche o di tempo non è stata completata. Pertanto, al momento il sistema non è in grado di inviare e-mail automatiche agli utenti.

## Possibili evoluzioni

- **Implementazione del sistema di invio email:** In futuro, sarà aggiunta la funzionalità per inviare automaticamente e-mail agli utenti, ad esempio per confermare una prenotazione o inviare aggiornamenti sullo stato dell'ordine.

## Note

- Per poter utilizzare l'API, è necessario avere un account registrato. Per registrarti, accedi al menu **"Prenotazioni"** e completa i dati richiesti.
- Assicurati che la **porta 80** sia libera per **Apache**. Se un altro programma sta già utilizzando questa porta, potresti dover cambiare la porta di Apache nel **XAMPP Control Panel**.
  - Clicca su **"Config"** accanto ad Apache, poi su **"httpd.conf"** e cerca la riga `Listen 80` per cambiarla.
- L'**admin** ha accesso solo al database per la gestione del sito.
- La funzionalità di **invio e-mail** non è ancora stata implementata.

## Credenziali di accesso

### ADMIN
```plaintext
Nome: admin
Password: admin
Email: admin@example.com
```

### UTENTE
```plaintext
Nome: prova
Password: prova
Email: prova@example.com
