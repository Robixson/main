// Klasa Todo, która zarządza zadaniami
class Todo {
    constructor() {
        this.tasks = []; // Tablica przechowująca zadania
        this.loadTasks(); // Ładuje zadania z LocalStorage po załadowaniu strony
        this.term = ''; // Fraza do wyszukiwania
    }

    // Rysuje wszystkie zadania na stronie
    draw() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Czyści istniejącą listę przed narysowaniem nowych zadań

        const filteredTasks = this.getFilteredTasks(); // Filtrowanie zadań na podstawie frazy
        filteredTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.setAttribute('data-index', index); // Dodanie indeksu zadania

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTaskCompletion(task));

            const taskText = document.createElement('p');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;

            // Podświetlanie wyszukanej frazy
            if (this.term) {
                const regex = new RegExp(`(${this.term})`, 'gi');
                taskText.innerHTML = task.text.replace(regex, `<span class="highlight">$1</span>`);
            }

            const taskDate = document.createElement('p');
            taskDate.classList.add('task-date');
            taskDate.textContent = task.dueDate || 'Brak daty';

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.innerHTML = '<img src="Images/dustbin_3569930.png" alt="Usuń">';
            deleteButton.addEventListener('click', () => this.removeTask(task));

            // Edycja zadania po kliknięciu
            taskText.addEventListener('click', () => this.editTask(task, 'text', index));
            taskDate.addEventListener('click', () => this.editTask(task, 'dueDate', index));

            taskDiv.appendChild(checkbox);
            taskDiv.appendChild(taskText);
            taskDiv.appendChild(taskDate);
            taskDiv.appendChild(deleteButton);

            taskList.appendChild(taskDiv);
        });
    }

    // Dodaje nowe zadanie do listy
    addTask(text, dueDate) {
        if (text.length < 3 || text.length > 255) {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            return;
        }

        if (dueDate && new Date(dueDate) < new Date()) {
            alert('Data musi być w przyszłości.');
            return;
        }

        const newTask = {
            text,
            dueDate,
            completed: false
        };
        this.tasks.push(newTask);
        this.saveTasks(); // Zapisanie zadania w LocalStorage
        this.draw(); // Przerysowanie listy
    }

    // Usuwa zadanie
    removeTask(taskToRemove) {
        this.tasks = this.tasks.filter(task => task !== taskToRemove);
        this.saveTasks(); // Zapisanie po usunięciu
        this.draw(); // Przerysowanie listy
    }

    // Zmienia status ukończenia zadania
    toggleTaskCompletion(taskToToggle) {
        taskToToggle.completed = !taskToToggle.completed;
        this.saveTasks(); // Zapisanie zmiany w LocalStorage
        this.draw(); // Przerysowanie listy
    }

    // Ładuje zadania z LocalStorage
    loadTasks() {
        const tasksFromStorage = localStorage.getItem('tasks');
        if (tasksFromStorage) {
            this.tasks = JSON.parse(tasksFromStorage);
        }
    }

    // Zapisuje zadania do LocalStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Ustawia frazę wyszukiwania
    setSearchTerm(term) {
        this.term = term.toLowerCase();
        this.draw(); // Przerysowanie listy po ustawieniu frazy
    }

    // Filtrowanie zadań na podstawie wyszukiwania
    getFilteredTasks() {
        if (!this.term) {
            return this.tasks;
        }

        return this.tasks.filter(task => task.text.toLowerCase().includes(this.term));
    }

   
   // Edycja zadania lub daty - zmiana na pole do edycji
    editTask(task, field, index) {
    const currentValue = task[field];
    const inputField = document.createElement('input');
    inputField.type = field === 'dueDate' ? 'date' : 'text';
    inputField.value = currentValue || '';

    // Zamieniamy element na pole edycji
    const taskDiv = document.querySelector(`[data-index='${index}']`);
    // Poprawiony selektor klas
    const taskElement = taskDiv.querySelector(field === 'dueDate' ? '.task-date' : '.task-text');
    taskElement.replaceWith(inputField);

    // Zapisanie wartości po zakończeniu edycji
    inputField.addEventListener('blur', () => {
        task[field] = inputField.value;
        this.saveTasks();
        this.draw();
    });

    inputField.focus();
}

}

// Tworzenie instancji klasy Todo
const todo = new Todo();

// Funkcja dodająca zadanie na podstawie wprowadzonych danych
function addTask() {
    const text = document.getElementById('text').value;
    const dueDate = document.getElementById('data').value;
    todo.addTask(text, dueDate);

    // Czyszczenie formularza po dodaniu zadania
    document.getElementById('text').value = '';
    document.getElementById('data').value = '';
}

// Funkcja wyszukiwania zadań
function searchTasks() {
    const searchTerm = document.getElementById('szukaj').value;
    todo.setSearchTerm(searchTerm);
}

// Pierwsze rysowanie listy po załadowaniu strony
todo.draw();
