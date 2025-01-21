const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortOrder = document.getElementById('sortOrder');
const imageGrid = document.getElementById('imageGrid');
const loading = document.getElementById('loading');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalLink = document.getElementById('modalLink');
const themeSwitch = document.querySelector('.theme-switch');

let isDarkTheme = true;
let currentBookmark = '';
let currentQuery = '';

themeSwitch.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeSwitch.innerHTML = isDarkTheme ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

async function searchImages(query, bookmark = '') {
    try {
        showLoading();
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodedQuery}&data={"options":{"query":"${encodedQuery}","scope":"pins","auto_correction_disabled":false,"top_pin_id":"","filters":""},"context":{}${bookmark ? `,"bookmark":"${bookmark}"` : ''}}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('فشل في جلب الصور');
        
        const data = await response.json();
        const results = data.resource_response.data.results;
        currentBookmark = data.resource_response.bookmark;
        
        results.forEach(pin => createImageCard(pin));
        
        if (currentBookmark) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
        
        showNotification('تم جلب الصور بنجاح!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('حدث خطأ أثناء البحث عن الصور', 'error');
    } finally {
        hideLoading();
    }
}

function createImageCard(pin) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const img = document.createElement('img');
    img.src = pin.images.orig.url;
    img.alt = pin.title || 'صورة من Pinterest';
    img.loading = 'lazy';
    
    img.addEventListener('click', () => {
        openModal(pin);
    });
    
    card.appendChild(img);
    imageGrid.appendChild(card);
}

function openModal(pin) {
    modal.style.display = 'block';
    modalImage.src = pin.images.orig.url;
    modalTitle.textContent = pin.title || 'بدون عنوان';
    modalDescription.textContent = pin.description || 'لا يوجد وصف';
    modalLink.href = `https://www.pinterest.com/pin/${pin.id}/`;
}

modal.querySelector('.close-modal').onclick = () => {
    modal.style.display = 'none';
};

function showLoading() {
    loading.classList.remove('hidden');
    searchBtn.disabled = true;
}

function hideLoading() {
    loading.classList.add('hidden');
    searchBtn.disabled = false;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        imageGrid.innerHTML = '';
        currentQuery = query;
        searchImages(query);
    } else {
        showNotification('الرجاء إدخال نص للبحث', 'error');
    }
});

loadMoreBtn.addEventListener('click', () => {
    if (currentQuery && currentBookmark) {
        searchImages(currentQuery, currentBookmark);
    }
});

sortOrder.addEventListener('change', () => {
    if (currentQuery) {
        imageGrid.innerHTML = '';
        searchImages(currentQuery);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchBtn.click();
    }
});

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};