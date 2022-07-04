import { uiManager } from './uiManager';
import { todoEntry } from './todoClass';

let todoManager = (function () {
    let todoArray = new Array();
    let folderArray = new Array();

    function addTodo(todo) {
        todoArray.push(todo);
    }


    function getTodo(index) {
        return todoArray[index];
    }

    
    return { addTodo, getTodo };
})();
 
export { todoManager };