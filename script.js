const stickerUrls = [
    'https://placehold.co/80',
    'https://placehold.co/80',
];

const stickerSelection = document.getElementById('stickerSelection');
const blankPage = document.getElementById('blankPage');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const fileInput = document.getElementById('fileInput');

// Initialize stickers from the selection panel
stickerUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.classList.add('sticker');
    img.draggable = true;
    img.id = `sticker-${index}`;
    stickerSelection.appendChild(img);

    img.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
    });
});

// Allow text stickers to be dragged from the selection
addTextSticker.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'text-sticker');
});

// Allow drop functionality on the blank page
blankPage.addEventListener('dragover', (e) => {
    e.preventDefault();
});

// Create stickers on the blank page when dropped
blankPage.addEventListener('drop', (e) => {
    e.preventDefault();
    const stickerId = e.dataTransfer.getData('text');

    if (stickerId === 'text-sticker') {
        createTextSticker(e.offsetX, e.offsetY);
    } else {
        const stickerElement = document.getElementById(stickerId);
        createImageSticker(stickerElement.src, e.offsetX, e.offsetY);
    }
});

function createTextSticker(x, y) {
    const textSticker = document.createElement('div');
    textSticker.classList.add('text-sticker');
    textSticker.style.left = `${x - 50}px`;
    textSticker.style.top = `${y - 25}px`;

    const textContent = document.createElement('p');
    textContent.textContent = 'Double click to edit';
    textSticker.appendChild(textContent);

    addRemoveButton(textSticker);
    textSticker.addEventListener('mousedown', startDragging);  // Enable dragging
    textSticker.addEventListener('dblclick', editTextSticker);

    blankPage.appendChild(textSticker);
}

function createImageSticker(src, x, y) {
    const newSticker = document.createElement('img');
    newSticker.src = src;
    newSticker.classList.add('placed-sticker');
    newSticker.style.left = `${x - 40}px`;
    newSticker.style.top = `${y - 40}px`;

    addRemoveButton(newSticker);
    newSticker.addEventListener('mousedown', startDragging);  // Enable dragging
    blankPage.appendChild(newSticker);
}

function addRemoveButton(sticker) {
    const removeButton = document.createElement('div');
    removeButton.classList.add('remove-button');
    removeButton.textContent = '×';
    removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sticker.remove();
    });
    sticker.appendChild(removeButton);
}

function editTextSticker(e) {
    const textSticker = e.target.closest('.text-sticker');
    const textContent = textSticker.querySelector('p');
    const input = document.createElement('textarea');
    input.value = textContent.textContent;
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.border = 'none';
    input.style.padding = '5px';
    input.style.resize = 'both';
    input.style.overflow = 'auto';

    textSticker.innerHTML = '';
    textSticker.appendChild(input);
    input.focus();

    input.addEventListener('blur', () => {
        textContent.textContent = input.value;
        textSticker.innerHTML = '';
        textSticker.appendChild(textContent);
        addRemoveButton(textSticker);
    });

    input.addEventListener('mousedown', (e) => e.stopPropagation());
}

function startDragging(e) {
    if (e.target.classList.contains('remove-button')) return;

    const sticker = e.target.closest('.placed-sticker, .text-sticker');
    let startX = e.clientX - sticker.offsetLeft;
    let startY = e.clientY - sticker.offsetTop;

    function moveSticker(e) {
        sticker.style.left = `${e.clientX - startX}px`;
        sticker.style.top = `${e.clientY - startY}px`;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', moveSticker);
        document.removeEventListener('mouseup', stopDragging);
    }

    document.addEventListener('mousemove', moveSticker);
    document.addEventListener('mouseup', stopDragging);
}

saveButton.addEventListener('click', saveState);
loadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', loadState);

function saveState() {
    const placedStickers = Array.from(blankPage.getElementsByClassName('placed-sticker'));
    const textStickers = Array.from(blankPage.getElementsByClassName('text-sticker'));

    const state = {
        imageStickers: placedStickers.map(sticker => ({
            type: 'image',
            src: sticker.src,
            left: sticker.style.left,
            top: sticker.style.top
        })),
        textStickers: textStickers.map(sticker => ({
            type: 'text',
            content: sticker.querySelector('p').textContent,
            left: sticker.style.left,
            top: sticker.style.top
        }))
    };

    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sticker-book.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadState(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const state = JSON.parse(e.target.result);
                blankPage.innerHTML = ''; // Clear current stickers

                state.imageStickers.forEach(stickerData => {
                    const sticker = document.createElement('img');
                    sticker.src = stickerData.src;
                    sticker.classList.add('placed-sticker');
                    sticker.style.left = stickerData.left;
                    sticker.style.top = stickerData.top;
                    addRemoveButton(sticker);
                    sticker.addEventListener('mousedown', startDragging);
                    blankPage.appendChild(sticker);
                });

                state.textStickers.forEach(stickerData => {
                    const sticker = document.createElement('div');
                    sticker.classList.add('text-sticker');
                    sticker.style.left = stickerData.left;
                    sticker.style.top = stickerData.top;
                    const textContent = document.createElement('p');
                    textContent.textContent = stickerData.content;
                    sticker.appendChild(textContent);
                    addRemoveButton(sticker);
                    sticker.addEventListener('mousedown', startDragging);
                    sticker.addEventListener('dblclick', editTextSticker);
                    blankPage.appendChild(sticker);
                });

                alert('Sticker book loaded successfully!');
            } catch (error) {
                alert('Error loading sticker book. Please make sure you selected a valid file.');
            }
        };
        reader.readAsText(file);
    }
}