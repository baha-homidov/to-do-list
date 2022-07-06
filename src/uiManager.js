import { todoManager } from './todoManager'
import { todoEntry } from './todoClass'
import { add, forOwn } from 'lodash';



let uiManager = (function () {
    //cache Dom
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const menu = document.querySelector('nav.menu');
    const entryContainer = document.querySelector('div.entry-container');
    const addTodoButton = document.querySelector('button.add-button');
    const addFolderButton = document.querySelector('button.add-folder');
    const addFolderText = document.querySelector('#folder-name');
    const addFolderForm = document.querySelector('form.add-folder');
    const submitFolderForm = document.querySelector('form.add-folder');
    const submitForm = document.querySelector('form.add-todo');
    const editForm = document.querySelector('form.edit-todo');
    const title = document.querySelector('input#title');
    const description = document.querySelector('textarea#description');
    const priority = document.querySelector('select#priority');
    const deadline = document.querySelector('input#deadline');
    const pageTitle = document.querySelector('.title > .folder-title');
    const pageTitleIcon = document.querySelector('.title > .icon');
    let menuItems = document.querySelectorAll('button.menu-item');


    let currentFolder = 'Inbox';


    function updateMenuItemEvents() {
        menuItems = document.querySelectorAll('button.menu-item');
        menuItems.forEach((button) => {
            button.addEventListener('click', () => {
                switchToFolder(button.getAttribute('folder'));
                button.classList.toggle('is-active');
            })
        })
    }

    function updateCanvas(folder) {
        let todoArray = todoManager.getTodoArray();
        clearCanvas();
        for (let i = 0; i < todoArray.length; i++) {
            if (todoArray[i].priority === folder) {
                addToDo(todoArray[i], i);
            }
        }
    }

    function switchToFolder(folder) {
        let iconPath;
        currentFolder = folder;
        switch (folder) {
            case 'Inbox':
                iconPath = 'assets/icons/inbox_big.svg';
                break;
            case 'Urgent':
                iconPath = 'assets/icons/urgent_big.svg';
                break;
            case 'Someday':
                iconPath = 'assets/icons/someday_big.svg';
                break;
            case 'Logbook':
                iconPath = 'assets/icons/logbook_big.svg';
                break;
            case 'Trash':
                iconPath = 'assets/icons/trash_big.svg';
                break;
            default:
                iconPath = 'assets/icons/folder_big.svg'
                break;
        }
        pageTitle.textContent = folder;
        pageTitleIcon.src = iconPath;
        updateCanvas(folder);
        addTodoButton.classList.remove('hide');
        if (folder == 'Trash' || folder == 'Logbook') {
            addTodoButton.classList.add('hide');
        }
        menuItems.forEach((button) => {
            button.classList.remove('is-active')
        });
    }



    function init() {
        updateMenuItemEvents();

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            sidebar.classList.toggle('is-active');
        })

        addTodoButton.addEventListener('click', () => {
            submitForm.classList.toggle('hide');
        })

        submitForm.addEventListener('submit', (event) => {
            event.preventDefault(); // stop page form refreshing
            let newTodo = new todoEntry(title.value, description.value, currentFolder, deadline.value);
            todoManager.addTodo(newTodo);
            updateCanvas(currentFolder);
            submitForm.reset();
            submitForm.classList.toggle('hide');
        })

        submitFolderForm.addEventListener('submit', (event) => {
            event.preventDefault(); // stop page from refreshing
            const newFolder = createElement('button', 'menu-item');
            newFolder.setAttribute('folder', addFolderText.value);
            const icon = createElement('img');
            icon.src = 'assets/icons/folder.svg';
            newFolder.appendChild(icon);
            newFolder.appendChild(document.createTextNode(addFolderText.value));
            

            menu.insertBefore(newFolder, addFolderButton);
            submitFolderForm.reset();
            submitFolderForm.classList.toggle('hide');
            updateMenuItemEvents();
        });


        addFolderButton.addEventListener('click', () => {
            addFolderForm.classList.toggle('hide');
        })


    }
    init();

    function clearCanvas() {
        let entryContainer = document.querySelector('div.entry-container');
        entryContainer.textContent = "";
    }




    function createElement(type, className, textContent) {
        let element = document.createElement(type);
        if (className) { element.classList.add(className); }
        if (textContent) { element.textContent = textContent; }
        return element;
    }



    function makeEntryElem(todo, index) {


        let entryElem = createElement('div', 'list-entry');
        entryElem.classList.add('target');
        entryElem.setAttribute("array-index", index);

        let checkButton = createElement('button', 'check-button');
        let buttonImg = document.createElement('img');
        buttonImg.src = "assets/icons/check_box.svg";
        checkButton.appendChild(buttonImg);
        checkButton.addEventListener('click', (event) => {
            todoManager.changeFolder('Logbook', index);
            updateCanvas(currentFolder);
            event.stopImmediatePropagation();
        })
        entryElem.appendChild(checkButton);
        entryElem.appendChild(createElement('div', 'title', todo.title));




        entryElem.addEventListener('click', (event) => {
            if (entryElem.classList.contains('is-active')) {

                return;
            }
            console.log('first');
            entryElem.textContent = '';
            entryElem.classList.add('is-active');


            entryElem.appendChild(createElement('div', 'title', todo.title));
            entryElem.appendChild(createElement('div', 'description', todo.description));
            entryElem.appendChild(createElement('div', 'line'));
            entryElem.appendChild(createElement('div', 'priority', `Priority: ${todo.priority}`));
            entryElem.appendChild(createElement('div', 'line'));
            entryElem.appendChild(createElement('div', 'deadline', `Deadline: ${todo.deadline}`));

            let buttons = createElement('div', 'buttons');
            let checkButton = createElement('button', 'check-button', "Mark Complete");


            checkButton.addEventListener('click', (event) => {
                todoManager.changeFolder('Logbook', index);
                updateCanvas(currentFolder);
                event.stopImmediatePropagation();
            })


            buttons.appendChild(checkButton);

            let editButton = createElement('button', 'edit-button', 'Edit');
            editButton.addEventListener('click', () => {
                editForm.classList.toggle('hide');
            })

            buttons.appendChild(editButton);


            let deleteButton = createElement('button', 'delete-button', "Delete To-Do");
            deleteButton.addEventListener('click', (event) => {
                todoManager.changeFolder('Trash', index);
                updateCanvas(currentFolder);

                event.stopImmediatePropagation();
            })
            buttons.appendChild(deleteButton);


            entryElem.appendChild(buttons);
            event.stopImmediatePropagation(); // stops further event listeners from firing
        })



        entryElem.addEventListener('click', () => {
            if (!(entryElem.classList.contains('is-active'))) {
                return;
            }

            entryElem.textContent = '';
            entryElem.classList.toggle('is-active');

            let checkButton = createElement('button', 'check-button');

            checkButton.addEventListener('click', (event) => {
                todoManager.changeFolder('Logbook', index);
                updateCanvas(currentFolder);
                event.stopImmediatePropagation();
            })


            let buttonImg = document.createElement('img');
            buttonImg.src = "assets/icons/check_box.svg";
            checkButton.appendChild(buttonImg);
            entryElem.appendChild(checkButton);
            entryElem.appendChild(createElement('div', 'title', todo.title));
        })

        return entryElem;
    }

    function addToDo(todo, index) {
        entryContainer.appendChild(makeEntryElem(todo, index));
    }





    return { clearCanvas, addToDo };

})();

export { uiManager };