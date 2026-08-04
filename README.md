Το compose δουλευει στις 06/06/2026 . Ειχε γινει λαθος στο docker desktop config , το διορθωσα, κατι εγινε με κάποιο update στον kernel του linux . 
    Τρέχει οπουδήποτε υπάρχει εγκατεστημένο το Docker , με την εντολή docker compose up . Ισως λανει κάποιο download . Αν κάνει και δνε έλουμε να το 
    διακινδυνεύσουμε τρέχουμε το --> docker compose start .
    χωρις επανακατασκευή των containers μας , για επανεκίννηση τρέχουμε το --> docker compose restart 
    για προβολή τρέχοντος / τρεχόντων containers type --> docker compose ps 
    για προβολή της εφαρμογής μέσω του nginx στο τερματικό τρέχουμε το --> curl -Ik http://localhost:80
    Ανοίγουμε 2-5 διαφορετικά incognito browser tabs και ξεκινάμε να συνομιλούμε δίνοντας username και roomname, έπειτα πατάμε join room . 
    Το κάθε room μπορεί να διαγραφεί ΜΟΝΟ αφού έχουν κάνει exit όλοι οι συμμετέχοντες .


