import todoManager from './todoManager';


let uiManager = (function () {
    //cache Dom
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const entryContainer = document.querySelector('div.entry-container');
    const addTodoButton = document.querySelector('button.add-button');
    const addTodoWindow = document.querySelector('form.add-todo');


    function init() {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            sidebar.classList.toggle('is-active');
        })

        addTodoButton.addEventListener('click', () => {
            console.log('add');
            addTodoWindow.classList.toggle('hide');
        })

    }

    init();

    function clearCanvas() {
        let entryContainer = document.querySelector('div.entry-container');
        entryContainer.textContent = "";
    }



    function makeEntryElem(todo, index) {

        function createElement(type, className, textContent) {
            let element = document.createElement(type);
            if (className) { element.classList.add(className); }
            if (textContent) { element.textContent = textContent; }
            return element;
        }

        let entryElem = createElement('div', 'list-entry');
        entryElem.classList.add('target');
        entryElem.setAttribute("array-index", index);

        let checkButton = createElement('button', 'check-button');
        let buttonImg = document.createElement('img');
        buttonImg.src = "assets/icons/check_box.svg";
        checkButton.appendChild(buttonImg);
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
                //check todo
                console.log('check');
                event.stopImmediatePropagation();
            })


            buttons.appendChild(checkButton);

            let deleteButton = createElement('button', 'delete-button', "Delete To-Do");
            deleteButton.addEventListener('click', (event) => {
                //delete todo
                console.log('delete');
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
                //check todo
                console.log('check');
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