# EntraceEase

[Watch Demo Video](https://drive.google.com/file/d/1TJ9kEArtCgoz9AOhXXxGaWw1rdUUNlD4/view?usp=sharing)

EntranceEase is a collaborative platform that acts as a bridge between test centers, entrance-conducting colleges, and exam-attending candidates (students). It allows test center managers to register using an email ID and password, and provide seat availability details (i.e., dates, seats, and vacancies). After this data is submitted, the system calculates the available seats, stores the information in a MongoDB database, and makes it visible for booking by the entrance-conducting colleges.

The college authorities can register and log in to the system, book available test centers, upload student data in CSV format, and assign test centers to students. The system then sends an email with the hall ticket and a personalized route to each student. Students can enter their date of birth to view and download their hall ticket.

Each hall ticket includes a QR code for verification and is automatically generated as a PDF file using our backend system, based on a predefined template.
