const expButton = document.getElementById("export");
class Variation {
    constructor(name, text, color, textColor) {
        this.name = name;
        this.text = text;
        this.color = color;
        this.textColor = textColor;
    }
    
    split() {
        return this.text.split(/\r?\n/);
    }
}

let variations = [];
let userText = [];
let name = "new project";

const box = document.getElementById("inputBox");
const project = document.getElementById("project");
const newProject = document.getElementById("new");
const cpResult = document.getElementById("copy");

project.addEventListener('click', () => {
    const result = prompt("Type the new name.", name);
    if (result) {
        name = result;
        reload();
    }
})

cpResult.addEventListener('click', async () => {
    const text = userText.join("\n");
    await navigator.clipboard.writeText(text);
    alert(text);
})

const newVname = document.querySelector("#newVname");
const newVtext = document.querySelector("#newVtext");
const newVcolor = document.querySelector("#newVcolor");
const newVtcolor = document.querySelector("#newVtcolor");
const newVadd = document.querySelector("#newVadd");

const variationsList = document.querySelector("#variations");

newVadd.addEventListener('click', e => {
    if (newVname.value && newVtext.value && newVcolor.value && newVtcolor.value) {
        variations.push(new Variation(newVname.value, newVtext.value, newVcolor.value, newVtcolor.value));
        reload();
    } else {
        alert("Fill all fields.")
    }
})

expButton.addEventListener('click', () => {
    const save = {
        name: name,
        vars: variations,
        usrInput: userText
    }
    
    const json = JSON.stringify(save);
    const blob = new Blob([json], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lyGEN-${name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
})


const blankline = document.createElement("p");
blankline.textContent = "Blank line";
blankline.className = "stringParagraph blankline";

function closeAllPopups() {
    const popups = document.querySelectorAll("aside");
    popups.forEach(popup => {
        popup.classList.add("closed");
    });
}

function togglePopup(tag) {
    const doc = document.querySelector(tag);
    if (doc.classList.contains('closed')) {
        closeAllPopups()
    }
    doc.classList.toggle("closed");
}

function reload() {
    listVariations();
    showVariations();
    autosave();
    project.textContent = name;
}

function populatePreview() {
    const doc = document.querySelector("#previewTextBox");
    doc.innerHTML = "";
    userText.forEach(line => {
        e = document.createElement('p');
        e.textContent = line;
        e.id = "previewText";
        doc.appendChild(e);
    });
}

newProject.addEventListener('click', () => {
    if(confirm("The current project will be deleted, continue?")) {
        variations = [];
        name = "new project";
        userText = [];
        reload();
    }
})

function createFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    
    input.addEventListener('change', handleFileUpload);
    
    document.body.appendChild(input);
    
    input.click();
    
    input.addEventListener('blur', () => {
        document.body.removeChild(input);
    });
}

const importButton = document.getElementById('import');
importButton.addEventListener('click', createFileInput);

function autosave() {
    console.log("Autosaving...");
    
    const save = {
        name: name,
        vars: variations,
        usrInput: userText
    }
    
    const json = JSON.stringify(save);
    
    localStorage.setItem("autosave", json);
}

function loadAutoSave() {
    const saveData = localStorage.getItem("autosave");
    if (saveData) {
        try {
            const save = JSON.parse(saveData);
            
            variations = save.vars.map(v => 
                new Variation(v.name, v.text, v.color, v.textColor)
            );
            
            name = save.name || "new project";
            userText = save.usrInput || [];
            
            reload();
        } catch (error) {
            console.error("Error loading autosave:", error);
            localStorage.removeItem("autosave");
        }
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            alert('Please select a JSON file');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const saveData = JSON.parse(e.target.result);
                
                if (!saveData.vars || !Array.isArray(saveData.vars)) {
                    throw new Error('Invalid file structure');
                }
                
                variations = saveData.vars.map(v => 
                    new Variation(
                        v.name || 'Unnamed Variation', 
                        v.text || '', 
                        v.color || '#FFFFFF', 
                        v.textColor || '#000000'
                    )
                );
                
                name = saveData.name || "new project";
                userText = saveData.usrInput || [];
                
                reload();
                
                alert('File successfully loaded');
            } catch (error) {
                console.error("Error parsing file:", error);
                alert('Invalid file format. Please select a valid LyGEN project file.');
            }
        };
        
        reader.onerror = function() {
            alert('Error reading file');
        };
        
        reader.readAsText(file);
    }
}

function listVariations() {
    variationsList.innerHTML = "";
    
    variations.forEach(variation => {
        const div = document.createElement("div");
        div.style.color = variation.textColor;            
        div.style.backgroundColor = variation.color;
        div.className = "variation";
        
        const pName = document.createElement("p");
        pName.textContent = variation.name;
        pName.className = "variationName";
        
        const copy = document.createElement("p");
        copy.textContent = "cp";
        copy.className = "variationCopy";
        
        const remove = document.createElement("p");
        remove.textContent = "d";
        remove.className = "variationDelete";
        
        const up = document.createElement("p");
        up.textContent = "↑";
        up.className = "variationUp";
        
        div.appendChild(pName);
        div.appendChild(copy);
        div.appendChild(remove);
        div.appendChild(up);
        
        variationsList.appendChild(div);
        
        remove.addEventListener('click', () => {
            variations = variations.filter(v => v !== variation);
            reload();
        })
        
        copy.addEventListener('click', async () => {
            await navigator.clipboard.writeText(variation.text);
            alert(variation.text);
        })
        
        function moveItem(array, index, shift) {
            if (index > 0) {
                const item = array.splice(index, 1)[0];
                array.splice(index + shift, 0, item);
            }
            return array;
        }
        
        up.addEventListener('click', () => {
            variations = moveItem(variations, variations.indexOf(variation), -1);
            reload();
        })
    });
}

function showVariations() {
    box.innerHTML = '';
    const maxLenght = Math.max(...variations.map(variation => variation.split().length));
    
    for (let i = 0; i < maxLenght; i++) {
        const pContainer = document.createElement("div");
        pContainer.className = `paragraphContainer paragraphContainer${i}`;
        var styleElem = document.head.appendChild(document.createElement("style"));
        styleElem.innerHTML = `.paragraphContainer${i}:before {content: "${i + 1}";}`;
        
        variations.forEach(variation => {
            if (variation.split()[i]) {
                const p = document.createElement("p");
                p.className = `string-${variation.name}-paragraph stringParagraph`;
                p.textContent = variation.split()[i];
                p.style.backgroundColor = variation.color;
                p.style.color = variation.textColor;
                pContainer.appendChild(p);
            } else {
                pContainer.appendChild(blankline);
            }
        });
        
        const ibox = document.createElement("input");
        ibox.type = "text";
        ibox.className = `ibox ibox${i}`
        ibox.value = userText[i] ?? "";
        ibox.dataset.lineNumber = i;
        ibox.placeholder = "...";
        ibox.addEventListener('change', () => {
            userText[ibox.dataset.lineNumber] = ibox.value;
            autosave();
        });
        ibox.addEventListener('change', () => {
            populatePreview();
        });
        pContainer.appendChild(ibox);
        box.appendChild(pContainer);
    }
}

loadAutoSave();
populatePreview();
reload();