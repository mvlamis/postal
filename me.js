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
    img.dataset.type = 'image';
    stickerSelection.appendChild(img);

    img.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'image', src: e.target.src }));
    });
});

// Allow text stickers to be dragged from the selection
const addTextSticker = document.getElementById('addTextSticker');
addTextSticker.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'text' }));
});

// Allow image stickers to be dragged from the selection
const addImageSticker = document.getElementById('addImageSticker');
addImageSticker.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'image', src: 'https://placehold.co/80' }));
});

// Allow link stickers to be dragged from the selection
const addLinkSticker = document.getElementById('addLinkSticker');
addLinkSticker.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'link', src: 'https://www.google.com' }));
});

// Allow audio stickers to be dragged from the selection
const addAudioSticker = document.getElementById('addAudioSticker');
addAudioSticker.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'audio', src: '' }));
});

// Allow drop functionality on the blank page
blankPage.addEventListener('dragover', (e) => {
    e.preventDefault();
});

// Create stickers on the blank page when dropped
blankPage.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text'));
    // if sticker is not link
    if (data.type !== 'link') {
        createSticker(data.type, data.src, e.offsetX, e.offsetY);
    } else if (data.type === 'link') {
        // show modal to get link
        showEditStickerModal(e);
    }
});

function createSticker(type, content, x, y) {
    const sticker = document.createElement('div');  // Always create a div container
    sticker.classList.add('placed-sticker');
    sticker.style.position = 'absolute';
    sticker.style.left = `${x - 40}px`;
    sticker.style.top = `${y - 40}px`;

    if (type === 'image') {
        const img = document.createElement('img');
        img.src = content;
        img.draggable = false;  // Prevent default dragging for images
        sticker.addEventListener('dblclick', showEditStickerModal);
        sticker.appendChild(img);
    } if (type === 'link') {
        const link = document.createElement('a');
        link.href = content;
        link.target = '_blank';
        link.textContent = 'Click to open link';
        sticker.appendChild(link);
    } if (type === 'audio') {
        const audio = document.createElement('audio');
        audio.src = content;
        audio.controls = true;
        sticker.appendChild(audio);
    } else if (type === 'text') {
        sticker.classList.add('text-sticker');
        const textContent = document.createElement('p');
        textContent.textContent = 'Double click to edit';
        sticker.appendChild(textContent);
        sticker.addEventListener('dblclick', editTextSticker);
    }

    addRemoveButton(sticker);
    sticker.addEventListener('mousedown', startDragging);
    blankPage.appendChild(sticker);
}

function showEditStickerModal(e) {
    const sticker = e.target.closest('.placed-sticker');
    console.log(sticker);

    const modal = document.getElementById('editStickerModal');
    modal.style.display = 'block';
    modal.querySelector('button').addEventListener('click', () => modal.style.display = 'none'); 
    
    // Image sticker
    if (sticker.querySelector('img')) {
        const editImageStickerURL = document.getElementById('editImageStickerURL');
        const editImageStickerAlt = document.getElementById('editImageStickerAlt');
        editImageStickerURL.value = sticker.querySelector('img').src;
        editImageStickerAlt.value = sticker.querySelector('img').alt;
        
        const saveEditButton = document.getElementById('saveEditButton');
        saveEditButton.addEventListener('click', () => {
            const editImageStickerURL = document.getElementById('editImageStickerURL');
            const editImageStickerAlt = document.getElementById('editImageStickerAlt');
            // save the changes
            sticker.querySelector('img').src = editImageStickerURL.value;
            sticker.querySelector('img').alt = editImageStickerAlt.value;
            // close the modal
            modal.style.display = 'none';
        });
    }
    // Link sticker
    if (sticker.querySelector('a')) {
        const editLinkStickerURL = document.getElementById('editLinkStickerURL');
        editLinkStickerURL.value = sticker.querySelector('a').href;
        
        const saveEditButton = document.getElementById('saveEditButton');
        saveEditButton.addEventListener('click', () => {
            const editLinkStickerURL = document.getElementById('editLinkStickerURL');
            // save the changes
            sticker.querySelector('a').href = editLinkStickerURL.value;
            // close the modal
            modal.style.display = 'none';
        });
    }
    
    
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
    console.log(e);
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

    const sticker = e.target.closest('.placed-sticker');
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
    const userID = '1';  // Replace with actual user ID
    const stickers = Array.from(blankPage.getElementsByClassName('placed-sticker'));

    const state = {
        stickers: stickers.map(sticker => ({
            type: sticker.querySelector('img') ? 'image' : 'text',
            content: sticker.querySelector('img') ? sticker.querySelector('img').src : sticker.querySelector('p').textContent,
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

                state.stickers.forEach(stickerData => {
                    createSticker(
                        stickerData.type,
                        stickerData.content,
                        parseInt(stickerData.left),
                        parseInt(stickerData.top)
                    );
                });

                alert('Sticker book loaded successfully!');
            } catch (error) {
                alert('Error loading sticker book. Please make sure you selected a valid file.');
            }
        };
        reader.readAsText(file);
    }
}