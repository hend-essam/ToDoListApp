/* start variables */
const date = document.querySelector(".date input");
const dateValue = document.querySelector(".date span");
const colors = document.querySelectorAll(".colors div");
const addList = document.querySelector(".add-list");
const addForm = document.querySelector(".add-list .add-form");
const addListBtn = document.querySelector(".add-list button");
const name = document.querySelector(".add-list input");
const listsContainer = document.querySelector(".lists");
const lists = document.querySelectorAll(".lists > div");
const addTaskBtn = document.querySelectorAll(".add-task");
const addIcon = document.querySelector(".add-list span");
const existName = document.querySelector(".exist-name");
const regexPattern = /\s+/g;
const nameRegex = /^[a-zA-Z0-9\u0600-\u06FF &]+$/;
/* end variables */

/* start add date */
date.addEventListener("input", function () {
  localStorage.setItem("date", date.value.split("-").reverse().join(" / "));
  updateDate();
});
function updateDate() {
  if (localStorage.date === undefined) {
    document.querySelector(".date span").textContent = "Enter Date";
  } else {
    document.querySelector(".date span").textContent =
      localStorage.getItem("date");
    document.querySelector(".date span").style.color = "#742323";
  }
}
updateDate();
/* end add date */

/* start select color */
function selectColor() {
  colors.forEach((color) => {
    color.addEventListener("click", function (e) {
      e.preventDefault();
      colors.forEach((color) => {
        color.classList.remove("active");
      });
      color.classList.add("active");
    });
  });
}
selectColor();
/* end select color */

/* start toggle form */
function openForm() {
  addForm.classList.add("open");
}
function closeAddForm() {
  document.addEventListener("click", (event) => {
    const targetElement = event.target;
    if (!addList.contains(targetElement)) {
      if (addForm.classList.contains("open")) {
        addForm.classList.remove("open");
      }
    }
  });
}
closeAddForm();
/* end toggle form */

/* start array of lists */
let arrayOflists = [
  {
    id: "L1",
    name: "MUST DO",
    color: "pale-pink",
    tasks: [],
  },
  {
    id: "L2",
    name: "COULD DO",
    color: "almond",
    tasks: [],
  },
  {
    id: "L3",
    name: "IF I HAVE TIME",
    color: "silver",
    tasks: [],
  },
];
/* end array of lists */
showList();
/* start show static lists */
function createStaticLists() {
  arrayOflists.forEach((list) => {
    newList(list.id, list.name, list.color);
    list.tasks.forEach((task) => addTask(task));
  });
}
createStaticLists();
/* end show static lists */
function defaultContent() {
  if (arrayOflists.length === 0) {
    listsContainer.innerHTML = `
      <div class="add-list-text">
        <h1>Add To Do List</h1>
        <button id="addButton">Add</button>
      </div>`;
  } else {
    const addListTextElement = document.querySelector(".lists .add-list-text");
    if (addListTextElement) {
      addListTextElement.remove();
    }
  }
}
document.addEventListener("click", function (event) {
  if (event.target && event.target.id === "addButton") {
    openForm();
  }
});
defaultContent();
/* start add new list */
addListBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const color = document
    .querySelector(".colors .active")
    ?.getAttribute("data-color");
  const uniqueName = name.value.trim().replace(regexPattern, " ");
  const newLists = arrayOflists.find(
    (listName) =>
      listName.name.trim().replace(regexPattern, " ").toLowerCase() ===
      uniqueName.toLowerCase()
  );

  if (name.value == "") {
    document.querySelector(".add-list label").classList.add("empty");
  }
  if (color == undefined) {
    document.querySelector(".colors p").classList.add("empty");
  }
  if (name.value !== "" && color !== undefined) {
    if (name.value.trim().match(nameRegex) !== null) {
      if (newLists === undefined) {
        addNewList(uniqueName, color);
        resetFormStyle(e);
        saveList();
        defaultContent();
      } else {
        existName.textContent = "this name is exist, please change name";
      }
    } else {
      existName.textContent =
        "Only characters A-Z, a-z, & and 0-9 are acceptable.";
    }
  }
});
function addNewList(name, color) {
  const list = {
    id: "L" + new Date().getTime(),
    name: name,
    color: color,
    tasks: [],
  };
  arrayOflists.push(list);
  newList(list.id, list.name, list.color);
}
function newList(id, name, color) {
  /* start create list*/
  const listDiv = document.createElement("div");
  const listContent = `
  <div class="list-head">
    <div class="list-name">
      <input value="${name}" readonly spellcheck="false" maxlength="14" placeholder="please write name">
      <i class="bi bi-check2"></i>
      <span></span>
    </div>
      <i class="bi bi-three-dots-vertical"></i>
      <div class="options">
        <i class="bi bi-trash3 delete-list"></i>
        <i class="bi bi-pencil edit-name"></i>
        <section class="colors-section">
          <i class="bi bi-palette color-palette"></i>
          <div class="list-colors">
            <span data-color="pale-pink"></span>
            <span data-color="almond"></span>
            <span data-color="lavender"></span>
            <span data-color="silver"></span>
          </div>
        </section>
    </div> 
  </div>
  <div class="add-task">
    <p>Add Task</p>
    <span>+</span>
  </div>
  <form></form>`;
  /* end create list */
  /* start add list name and list color */
  listDiv.setAttribute("id", id);
  listDiv.setAttribute("data-color", color);
  listDiv.innerHTML = listContent;
  listsContainer.appendChild(listDiv);
  /* end add list name and list color */
  // Initialize SortableJS for this list
  initializeSortable(id);
}
/* end add new list */

/* start initialize SortableJS */
function initializeSortable(listId) {
  const listElement = document.getElementById(listId);
  if (listElement) {
    new Sortable(listElement.querySelector("form"), {
      animation: 150, // Smooth animation
      ghostClass: "sortable-ghost", // Class for the ghost element
      chosenClass: "sortable-chosen", // Class for the chosen item
      dragClass: "sortable-drag", // Class for the dragging item
      handle: ".bi-list", // Only allow dragging when the handle is used
      onEnd: function (evt) {
        // Save the new order of tasks
        const taskElements = Array.from(evt.from.children);
        const taskIds = taskElements.map((task) => task.id);
        const listId = evt.from.parentNode.id;

        // Update the order in the arrayOflists
        const list = arrayOflists.find((list) => list.id === listId);
        if (list) {
          list.tasks.sort((a, b) => {
            return taskIds.indexOf(a.id) - taskIds.indexOf(b.id);
          });
          saveList(); // Save the updated order to localStorage
        }
      },
    });
  }
}
/* end initialize SortableJS */

/* start reset form style */
function resetFormStyle(e) {
  e.preventDefault();
  addForm.classList.remove("open");
  name.value = "";
  colors.forEach((color) => {
    color.classList.remove("active");
  });
  document.querySelector(".add-list label").classList.remove("empty");
  document.querySelector(".colors p").classList.remove("empty");
  existName.textContent = "";
}
/* end reset form style */

listsContainer.addEventListener("click", function (e) {
  editListName(e);
  removeList(e);
  addNewTask(e);
  saveTask(e);
  deleteTask(e);
  completeTask(e);
});

listsContainer.addEventListener("mouseover", () => changeListColor());

/* start get ancestor of element*/
function getAncestor(element, level) {
  let node = element;
  for (let i = 0; i < level; i++) {
    node = node.parentNode;
  }
  return node;
}
/* end get ancestor of element*/

/* start change list color */
function changeListColor() {
  const listColor = document.querySelectorAll(".list-colors span");
  listColor.forEach((color) => {
    color.addEventListener("click", function (e) {
      e.preventDefault();
      listColor.forEach((color) => {
        color.classList.remove("active");
      });
      color.classList.add("active");
      getAncestor(color, 5).setAttribute(
        "data-color",
        color.getAttribute("data-color")
      );
      arrayOflists.find((list) => list.id === getAncestor(color, 5).id).color =
        color.getAttribute("data-color");
      saveList();
    });
  });
}
changeListColor();
/* end change list color */

/* start edit list name */
function editListName(e) {
  const target = e.target;
  if (target.classList.contains("edit-name")) {
    e.preventDefault();
    const edit = getAncestor(target, 3).querySelector(".list-head input");
    const inputName = getAncestor(target, 3).querySelector(".list-name");
    const saveNameBtn = getAncestor(target, 3).querySelector(".list-name > i");
    const thisList = getAncestor(target, 2);

    edit.removeAttribute("readonly");
    inputName.classList.add("edit");
    edit.focus();

    saveNameBtn.addEventListener("click", function () {
      const inputValue = edit.value.trim().toLowerCase();
      const newListName = Array.from(
        document.querySelectorAll(`.list-name > input`)
      )
        .filter(
          (ele) =>
            ele.attributes[0].value.trim().toLowerCase() !==
            thisList
              .querySelector("input")
              .attributes[0].value.trim()
              .toLowerCase()
        )
        .find((ele) => ele.attributes[0].value.toLowerCase() == inputValue);

      if (
        edit.value.trim().match(nameRegex) !== null &&
        newListName === undefined
      ) {
        edit.setAttribute("readonly", "");
        inputName.classList.remove("edit");
        inputName.querySelector("span").textContent = "";
        edit.setAttribute("value", edit.value.replace(regexPattern, " "));
        arrayOflists.find((list) => list.id === thisList.parentNode.id).name =
          edit.value.replace(regexPattern, " ");
        saveList();
      }
      if (edit.value.trim().match(nameRegex) === null && edit.value !== "") {
        inputName.querySelector("span").textContent =
          "Only characters A-Z, a-z, & and 0-9 are acceptable.";
      }
      if (newListName !== undefined) {
        inputName.querySelector("span").textContent =
          "this name is exist, please change name";
      }
    });
  }
}
/* end edit list name */

/* start remove list */
function removeList(e) {
  const target = e.target;
  if (target.classList.contains("delete-list")) {
    e.preventDefault();
    const thisList = getAncestor(target, 3);
    arrayOflists = arrayOflists.filter((list) => list.id !== thisList.id);
    thisList.remove();
    saveList();
    defaultContent();
  }
}
/* end remove list */

/* start add new task */
function addNewTask(e) {
  const target = e.target;
  if (target.closest(".add-task")) {
    const taskDetails = {
      listId: target.closest(".add-task").parentNode.id,
      id: "T" + new Date().getTime(),
      title: "",
      complete: false,
    };
    const pushTask = arrayOflists.find(
      (list) => list.id == taskDetails.listId
    ).tasks;
    const emptyTaskId = pushTask.filter((t) => t.title == "")[0]?.id;
    if (pushTask.filter((t) => t.title == "").length == 0) {
      e.preventDefault();
      pushTask.push(taskDetails);
      addTask(taskDetails);
      saveList();
    } else {
      const emptyInput = document
        .querySelector(`#${emptyTaskId}`)
        .querySelector(".task-content");
      emptyInput.setAttribute("placeholder", "you must write something!");
    }
  }
}
function addTask(task) {
  const form = document.querySelector(`#${task.listId} form`);
  const taskHTML = `
    <div class="task ${task.complete ? "done" : ""}" id="${task.id}">
      <i class="bi bi-list"></i>
      <input type="checkbox" class="check-task" ${
        task.complete ? "checked" : ""
      }>
      <input type="text" spellcheck="false" class="task-content" value="${
        task.title
      }" ${task.complete ? "readonly" : ""}>
      <i class="bi bi-x"></i>
      <i class="bi bi-check2"></i>
    </div>`;
  form.insertAdjacentHTML("beforeend", taskHTML);
}
/* end add new task */

/* start delete task */
function deleteTask(e) {
  target = e.target;
  if (target.classList.contains("bi-x")) {
    e.preventDefault();
    const tasks = arrayOflists
      .find((list) => list.id === getAncestor(target, 3).id)
      .tasks.filter((task) => task.id !== target.parentNode.id);

    arrayOflists.find((list) => list.id === getAncestor(target, 3).id).tasks =
      tasks;
    target.parentNode.remove();
    saveList();
  }
}
/* end delete task */

/* start save task */
function saveTask(e) {
  const target = e.target;
  if (target.classList.contains("task-content")) {
    e.preventDefault();
    const saveTaskBtn = target.parentNode.querySelector(".bi-check2");
    const deleteBtn = target.parentNode.querySelector(".bi-x");
    target.addEventListener("input", function () {
      if (
        arrayOflists
          .find((list) => list.id === getAncestor(target, 3).id)
          .tasks.find((task) => task.id === target.parentNode.id).title !==
        target.value
      ) {
        saveTaskBtn.style.display = "block";
        deleteBtn.style.display = "none";
      } else if (target.value === "") {
        saveTaskBtn.style.display = "none";
        deleteBtn.style.display = "block";
      }
    });
    saveTaskBtn.addEventListener("click", function () {
      if (target.value === "") {
        target.setAttribute("placeholder", "you must write something!");
      } else {
        arrayOflists
          .find((list) => list.id === getAncestor(target, 3).id)
          .tasks.find((task) => task.id === target.parentNode.id).title =
          target.value;
        saveTaskBtn.style.display = "none";
        deleteBtn.style.display = "block";
        saveList();
      }
    });
  }
}
/* end save task */
/* start complete task */
function completeTask(e) {
  const target = e.target;
  if (target.classList.contains("check-task")) {
    const taskElement = target.parentNode;
    const taskContent = taskElement.querySelector(".task-content");
    const listID = getAncestor(target, 3).id;
    const taskID = taskElement.id;

    const list = arrayOflists.find((list) => list.id === listID);
    const task = list.tasks.find((task) => task.id === taskID);

    if (!taskContent.value.trim()) {
      taskContent.setAttribute("placeholder", "You must write something!");
      return;
    }

    task.complete = !task.complete;
    taskElement.classList.toggle("done", task.complete);
    taskContent.toggleAttribute("readonly", task.complete);

    saveList();
  }
}
/* end complete task */

/* start save lists in localstorage */
function saveList() {
  try {
    localStorage.setItem("lists", JSON.stringify(arrayOflists));
  } catch (error) {
    console.error("Failed to save lists to localStorage:", error);
  }
}
/* end save lists in localstorage */

function showList() {
  let listsInLocalstorage = window.localStorage.getItem("lists");
  if (listsInLocalstorage) {
    arrayOflists = JSON.parse(listsInLocalstorage);
  }
}

/* --------------------------------------- */
function isLocalStorageFull() {
  const test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch (e) {
    return true;
  }
}
if (isLocalStorageFull()) {
  if (confirm("Your localStorage is full. Would you like to clear it?")) {
    localStorage.clear();
    alert("LocalStorage has been cleared.");
  } else {
    alert("LocalStorage has not been cleared.");
  }
}
/* --------------------------------------- */
