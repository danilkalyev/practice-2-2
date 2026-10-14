import './styles.css';
import { Book, formatBook, Catalog} from './task1-types';
import { addBook, removeBook, getBook} from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from "./task4-integration";
import { filterByTitle, sortBooks } from './task5-utils';

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ
// ============================================================
// Начальные данные — используются, если в localStorage ещё ничего нет
let catalog: Catalog = {
  '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
};

// Задание 1: если каталог уже сохранён — берём его вместо начальных данных
const saved = localStorage.getItem('catalog');
if (saved) {
  catalog = JSON.parse(saved) as Catalog;
}

// ============================================================
// СОХРАНЕНИЕ В localStorage (Задание 1)
// ============================================================
// localStorage хранит только строки, поэтому превращаем каталог в JSON
function saveCatalog() {
  localStorage.setItem('catalog', JSON.stringify(catalog));
}


// ============================================================
// DOM-элементы
// ============================================================
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;

// Задание 2: поиск по названию и сортировка
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;


function renderBooks(books: Book[]) {
  bookList.innerHTML = ''; 

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    // Задание 3: fade-in — плавное появление карточки (анимация описана в styles.css)
    card.classList.add('book-card', 'fade-in');
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = formatBook(book);
    
    const authorsEl = document.createElement('p');
    authorsEl.textContent = `Авторы: ${book.authors.join(', ')}`;
    
    card.append(titleEl, authorsEl);
    
    if (book.year !== undefined) {
      const yearEl = document.createElement('p');
      yearEl.textContent = `Год: ${book.year}`;
      card.append(yearEl);
    }
    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    // ============================================================
    // ЗАДАНИЕ 0: КНОПКА «УДАЛИТЬ»
    // ============================================================
    // Кнопка создаётся для каждой карточки и через замыкание «помнит» свою книгу
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog();
      updateBookList();
    });
    card.append(deleteBtn);

    bookList.append(card);
  });
}

// ============================================================
// ПЕРВИЧНАЯ ОТРИСОВКА
// ============================================================
// К этому моменту catalog уже содержит либо начальные данные,
// либо данные из localStorage (см. самый верх файла).
updateBookList();


// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try{
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);
    catalog = addBook(catalog, newBook);
    saveCatalog();

    form.reset();
    updateBookList();
  } catch(error){
    if(error instanceof Error){   
      errorMessage.textContent = error.message; 
    }
  }
});


// ============================================================
// ФИЛЬТРЫ, ПОИСК И СОРТИРОВКА
// ============================================================
// Собирает все фильтры из полей, применяет их и сортирует результат.
// Вызывается при старте, после добавления/удаления и при любой смене фильтров.
function updateBookList() {
  const filters: ((book: Book) => boolean)[] = [];

  if (authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }
  if (searchInput.value.trim()) {
    filters.push(filterByTitle(searchInput.value.trim()));
  }

  const allBooks = Object.values(catalog);
  const filteredBooks = applyFilters(allBooks, filters);

  // у select .value имеет тип string, поэтому приводим к нужным двум вариантам
  renderBooks(sortBooks(filteredBooks, sortBySelect.value as "year" | "rating"));
}

filterBtn.addEventListener('click', updateBookList);
searchInput.addEventListener('input', updateBookList);
sortBySelect.addEventListener('change', updateBookList);