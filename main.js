// Oculandia VR - Main JavaScript File

// Global state management
const AppState = {
    currentPage: 'home',
    feedPosts: [],
    events: [],
    deals: [],
    currentUser: null,
    filters: {
        category: 'all',
        searchQuery: ''
    }
};

// Persisted storage keys
const STORAGE_KEYS = {
    posts: 'oculandia_posts'
};

// Register the service worker on page load.  This turns the site into a
// Progressive Web App, enabling offline caching and installation on
// mobile/desktop.  See MDN for details on PWAs and service workers【352510928691066†L215-L239】.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker registered:', reg.scope))
            .catch(err => console.warn('❌ Service Worker registration failed:', err));
    });
}

// Particle background using p5.js
let particles = [];
let particleCount = 50;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('particle-bg');
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            vx: random(-0.5, 0.5),
            vy: random(-0.5, 0.5),
            size: random(1, 3),
            opacity: random(0.1, 0.3)
        });
    }
}

function draw() {
    clear();
    
    // Update and draw particles
    for (let particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Draw particle
        fill(255, 255, 255, particle.opacity * 255);
        noStroke();
        ellipse(particle.x, particle.y, particle.size);
    }
    
    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let d = dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            if (d < 100) {
                stroke(255, 255, 255, (1 - d/100) * 50);
                strokeWeight(0.5);
                line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Mock data generation
const MockData = {
    /**
     * Generate a set of initial posts.  Each post has a unique `id` and
     * timestamp stored as an actual Date (createdAt).  This allows the
     * client to display human‑readable relative times (e.g. “10h fa”) using
     * the `timeAgo` helper.  The `commentsList` array will store
     * individual comments for each post, and the `liked` flag tracks
     * whether the current user has liked the post so that like/unlike
     * toggling is possible without a backend.
     */
    generatePosts: () => {
        const now = Date.now();
        return [
            {
                id: 1,
                author: 'MarcoVR_88',
                avatar: 'https://kimi-web-img.moonshot.cn/img/roadtovrlive-5ea0.kxcdn.com/0163f2b2e0a06401857787aa998f9815ebffdda5.jpg',
                createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2h fa
                category: 'Meta Quest',
                content: 'Appena provato Batman: Arkham Shadow su Quest 3! 🦇 L\'immersività è assurda, sembra davvero di essere a Gotham. I controlli sono perfetti e la storia mi sta rapendo. Consigliatissimo!',
                image: 'https://kimi-web-img.moonshot.cn/img/www.virtualrealitytimes.com/039f9b7ba19d6b07c30567bc1637ae4b5b637e5c.jpg',
                likes: 47,
                comments: 0,
                shares: 8,
                liked: false,
                saved: false,
                commentsList: []
            },
            {
                id: 2,
                author: 'VR_Ludovica',
                avatar: 'https://kimi-web-img.moonshot.cn/img/www.vrfitnessinsider.com/275563f9766caf6ee8c9635e95204a505ac3b404.jpg',
                createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(), // 4h fa
                category: 'PSVR2',
                content: 'Organizzo un torneo di Beat Saber questo sabato alle 18:00! 🎵 Ci saranno premi in palio e tanto divertimento. Chi si unisce? #VRTournament #BeatSaber',
                isEvent: true,
                eventData: {
                    title: 'Torneo Beat Saber',
                    date: 'Sabato 15 Ottobre, 18:00',
                    prizes: 'Gift Card Steam + Visibilità'
                },
                likes: 89,
                comments: 0,
                shares: 15,
                liked: false,
                saved: false,
                commentsList: []
            },
            {
                id: 3,
                author: 'TechVR_Italy',
                avatar: 'https://kimi-web-img.moonshot.cn/img/cdn.autonomous.ai/56cd100b78ba9fb99350e06d0d731cdc2cb48638.webp',
                createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(), // 6h fa
                category: 'PC VR',
                content: 'Recensione completa del nuovo Valve Index 2! 🔧 Dopo 2 settimane di test intensivi, posso dire che è un grande passo avanti. Display migliorato, tracking perfetto e comfort eccellente. Prezzo alto ma vale ogni centesimo! #ValveIndex #PCVR',
                image: 'https://kimi-web-img.moonshot.cn/img/cdn.autonomous.ai/29b054100e001265d76e6c068e4b5a5ed8d241b0.webp',
                likes: 156,
                comments: 0,
                shares: 28,
                liked: false,
                saved: false,
                commentsList: []
            }
        ];
    },
    
    generateEvents: () => [
        {
            id: 1,
            title: 'VR Gaming Marathon',
            date: '2024-10-20',
            time: '14:00',
            location: 'Milano VR Center',
            type: 'Gaming',
            attendees: 24,
            maxAttendees: 30,
            description: 'Maratona di gaming VR con diversi titoli e competizioni'
        },
        {
            id: 2,
            title: 'Beat Saber Tournament',
            date: '2024-10-22',
            time: '18:00',
            location: 'Roma Esports Arena',
            type: 'Tournament',
            attendees: 16,
            maxAttendees: 20,
            description: 'Torneo competitivo di Beat Saber con premi in palio'
        },
        {
            id: 3,
            title: 'VR Development Workshop',
            date: '2024-10-25',
            time: '10:00',
            location: 'Online',
            type: 'Workshop',
            attendees: 45,
            maxAttendees: 50,
            description: 'Workshop su Unity e VR development per principianti'
        }
    ],
    
    generateDeals: () => [
        {
            id: 1,
            title: 'Meta Quest 3 - 512GB',
            originalPrice: 699,
            currentPrice: 549,
            discount: 21,
            vendor: 'Amazon',
            category: 'Hardware',
            image: 'https://kimi-web-img.moonshot.cn/img/m.media-amazon.com/3767f504e2b03c55a08d10acdc495570365e4703.jpg',
            rating: 4.8,
            reviews: 1247
        },
        {
            id: 2,
            title: 'Beat Saber + DLC Pack',
            originalPrice: 39.99,
            currentPrice: 19.99,
            discount: 50,
            vendor: 'Steam VR',
            category: 'Games',
            image: 'https://kimi-web-img.moonshot.cn/img/images.stockcake.com/6c3198120160d24adce20c365ef90274ba7f047b.jpg',
            rating: 4.9,
            reviews: 15892
        },
        {
            id: 3,
            title: 'PSVR2 Sense Controller',
            originalPrice: 149,
            currentPrice: 99,
            discount: 34,
            vendor: 'MediaWorld',
            category: 'Accessories',
            image: 'https://kimi-web-img.moonshot.cn/img/gmedia.playstation.com/afb6a6020b7d6ff9d4a1ba3d9cfb2d3e85e3a45f',
            rating: 4.6,
            reviews: 456
        }
    ]
};

// Animation utilities
const Animations = {
    fadeInUp: (element, delay = 0) => {
        anime({
            targets: element,
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600,
            delay: delay,
            easing: 'easeOutCubic'
        });
    },
    
    staggerIn: (elements, staggerDelay = 100) => {
        anime({
            targets: elements,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 500,
            delay: anime.stagger(staggerDelay),
            easing: 'easeOutCubic'
        });
    },
    
    pulseScale: (element) => {
        anime({
            targets: element,
            scale: [1, 1.05, 1],
            duration: 600,
            easing: 'easeInOutSine'
        });
    }
};

/* --------------------------------------------------------------------------
 * Helpers
 *
 * Several small utility functions used across the app.  The
 * `timeAgo()` helper converts a timestamp (ISO or Date) into a human
 * readable relative time (e.g. “3h fa” or “2 giorni fa”).
 */

/**
 * Convert a date into a relative string.  For example, if a post was
 * created 3 hours ago, this returns "3h fa".  It supports minutes,
 * hours, days, months and years.  If the date is in the future or
 * within a minute, it returns "Adesso".
 *
 * @param {string|Date} date
 * @returns {string}
 */
function timeAgo(date) {
    const ts = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
    const now = Date.now();
    let diff = Math.floor((now - ts) / 1000);
    if (diff < 60) return 'Adesso';
    const units = [
        { labelSingular: 'anno', labelPlural: 'anni', seconds: 31536000 },
        { labelSingular: 'mese', labelPlural: 'mesi', seconds: 2592000 },
        { labelSingular: 'giorno', labelPlural: 'giorni', seconds: 86400 },
        { labelSingular: 'ora', labelPlural: 'ore', seconds: 3600 },
        { labelSingular: 'minuto', labelPlural: 'minuti', seconds: 60 }
    ];
    for (const unit of units) {
        const count = Math.floor(diff / unit.seconds);
        if (count >= 1) {
            return `${count} ${count === 1 ? unit.labelSingular : unit.labelPlural} fa`;
        }
    }
    return 'Adesso';
}

/**
 * Stats manager updates the homepage counters (members, events, deals).
 * It attempts to fetch the number of Telegram group members from the
 * backend endpoint `/api/telegram/members`.  If the request fails or
 * returns an error, it leaves the members count unchanged.  The
 * events and deals counts are derived from `AppState.events` and
 * `AppState.deals` respectively.
 */
const StatsManager = {
    async load() {
        // Update members count from API if available
        const membersElem = document.getElementById('members-count');
        if (membersElem) {
            try {
                const res = await fetch('/api/telegram/members');
                if (res.ok) {
                    const data = await res.json();
                    if (data && typeof data.count === 'number') {
                        membersElem.textContent = data.count;
                    }
                }
            } catch (err) {
                // swallow errors silently
            }
        }
        // Events and deals counts
        const eventsElem = document.getElementById('events-count');
        const dealsElem = document.getElementById('deals-count');
        if (eventsElem) {
            try {
                // If events not yet loaded, generate them once
                if (!AppState.events || AppState.events.length === 0) {
                    AppState.events = MockData.generateEvents();
                }
                eventsElem.textContent = AppState.events.length;
            } catch (e) {
                eventsElem.textContent = '0';
            }
        }
        if (dealsElem) {
            try {
                if (!AppState.deals || AppState.deals.length === 0) {
                    AppState.deals = MockData.generateDeals();
                }
                dealsElem.textContent = AppState.deals.length;
            } catch (e) {
                dealsElem.textContent = '0';
            }
        }
    }
};

/**
 * Comment management handles displaying and storing comments per post and
 * reaction counts on comments.  Comments are stored in
 * `post.commentsList`, each with an `id`, `author`, `content`,
 * `createdAt`, and reaction counters.  Reactions support three
 * variants: "good", "bad", and "wow".  The current user can apply
 * exactly one reaction per comment; toggling a reaction removes it.
 */
const CommentsManager = {
    /**
     * Opens a modal showing existing comments for a post and allowing the
     * user to add a new comment.  After submitting a comment, the list
     * updates and the comment count on the post updates as well.  It
     * persists changes to localStorage.
     *
     * @param {Object} post The post to show comments for
     */
    open(post) {
        // Build comment list HTML
        const commentListHtml = post.commentsList && post.commentsList.length
            ? post.commentsList.map(comment => {
                const reactionIcons = this._renderReactions(comment);
                return `
                <div class="mb-3 border-b border-gray-700 pb-3">
                    <div class="flex items-start space-x-2">
                        <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            ${comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-semibold mb-1">${comment.author}</p>
                            <p class="text-sm text-gray-300 mb-1">${comment.content}</p>
                            <div class="flex items-center text-xs text-gray-500 space-x-3">
                                <span>${timeAgo(comment.createdAt)}</span>
                                <span>${reactionIcons}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('') : '<p class="text-gray-400 text-sm mb-4">Nessun commento ancora. Sii il primo a commentare!</p>';

        const modalContent = `
            <div class="max-h-80 overflow-y-auto pr-2 mb-4">
                ${commentListHtml}
            </div>
            <textarea id="newCommentText" class="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-green-400 outline-none" rows="3" placeholder="Scrivi il tuo commento..."></textarea>
        `;
        DOM.showModal('Commenti', modalContent, [
            { text: 'Pubblica', class: 'btn-primary', onClick: () => { CommentsManager.addComment(post); } }
        ]);
        // Attach reaction event listeners inside modal
        setTimeout(() => {
            document.querySelectorAll('[data-comment-id]').forEach(el => {
                el.addEventListener('click', (e) => {
                    const cid = el.getAttribute('data-comment-id');
                    const type = el.getAttribute('data-reaction');
                    CommentsManager.toggleReaction(post, cid, type);
                });
            });
        }, 0);
    },
    /**
     * Render the reaction icons for a comment.  Each reaction button
     * contains data attributes to identify the comment and reaction type.
     */
    _renderReactions(comment) {
        const types = [
            { key: 'good', icon: '👍' },
            { key: 'bad', icon: '👎' },
            { key: 'wow', icon: '🤯' }
        ];
        return types.map(t => {
            const count = comment.reactions[t.key] || 0;
            const isActive = comment.userReaction === t.key;
            return `<span data-comment-id="${comment.id}" data-reaction="${t.key}" class="cursor-pointer mr-2 ${isActive ? 'text-green-400' : ''}">${t.icon} ${count}</span>`;
        }).join('');
    },
    /**
     * Add a new comment to a post.  Reads from the textarea in the modal.
     * Persists to storage and updates comment count.
     */
    addComment(post) {
        const textarea = document.getElementById('newCommentText');
        if (!textarea || !textarea.value.trim()) return;
        const content = textarea.value.trim();
        const comment = {
            id: Date.now().toString(),
            author: 'Tu',
            content,
            createdAt: new Date().toISOString(),
            reactions: { good: 0, bad: 0, wow: 0 },
            userReaction: null
        };
        post.commentsList = post.commentsList || [];
        post.commentsList.push(comment);
        post.comments = post.commentsList.length;
        // Persist posts
        try {
            localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(AppState.feedPosts));
        } catch (e) {}
        // Close modal and reopen to reflect new comment
        document.querySelectorAll('.fixed.inset-0').forEach(el => el.remove());
        CommentsManager.open(post);
        // Update comment count in UI
        FeedManager.render();
    },
    /**
     * Toggle a reaction on a comment.  Ensures the user has only one
     * active reaction at a time.  Clicking the same reaction removes it.
     */
    toggleReaction(post, commentId, reactionType) {
        const comment = post.commentsList.find(c => c.id === commentId);
        if (!comment) return;
        // Remove previous reaction
        if (comment.userReaction) {
            comment.reactions[comment.userReaction] = Math.max(0, (comment.reactions[comment.userReaction] || 1) - 1);
        }
        // Apply new reaction if it was different; otherwise clear
        if (comment.userReaction !== reactionType) {
            comment.userReaction = reactionType;
            comment.reactions[reactionType] = (comment.reactions[reactionType] || 0) + 1;
        } else {
            comment.userReaction = null;
        }
        // Persist and refresh modal
        try {
            localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(AppState.feedPosts));
        } catch (e) {}
        document.querySelectorAll('.fixed.inset-0').forEach(el => el.remove());
        CommentsManager.open(post);
    }
};

// DOM utilities
const DOM = {
    createElement: (tag, className = '', content = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    },
    
    showModal: (title, content, actions = []) => {
        const modal = DOM.createElement('div', 'fixed inset-0 bg-black/50 flex items-center justify-center z-50');
        const modalContent = DOM.createElement('div', 'card-glass rounded-xl p-6 m-4 max-w-sm w-full');
        // Build buttons HTML first; each button will have an index to bind events later
        const buttonsHtml = actions.map((action, idx) => `<button data-modal-action-index="${idx}" class="${action.class} flex-1 py-2 px-4 rounded-lg">${action.text}</button>`).join('');
        modalContent.innerHTML = `
            <h3 class="text-xl font-bold mb-4 orbitron">${title}</h3>
            <div class="mb-6">${content}</div>
            <div class="flex space-x-3">
                ${buttonsHtml}
                <button class="btn-secondary flex-1 py-2 px-4 rounded-lg" onclick="this.closest('.fixed').remove()">Annulla</button>
            </div>
        `;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        Animations.fadeInUp(modalContent);
        // Bind button events
        actions.forEach((action, idx) => {
            const btn = modalContent.querySelector(`[data-modal-action-index="${idx}"]`);
            if (btn) {
                btn.addEventListener('click', () => {
                    if (typeof action.onClick === 'function') {
                        action.onClick();
                    }
                    // After action, close modal
                    const top = btn.closest('.fixed');
                    if (top) top.remove();
                });
            }
        });
    },
    
    showToast: (message, type = 'success') => {
        const toast = DOM.createElement('div', `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`);
        toast.textContent = message;
        document.body.appendChild(toast);
        
        anime({
            targets: toast,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutCubic'
        });
        
        setTimeout(() => {
            anime({
                targets: toast,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInCubic',
                complete: () => toast.remove()
            });
        }, 3000);
    }
};

// Feed management
const FeedManager = {
    init: () => {
        // Load posts from localStorage if available; fall back to mock data
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.posts);
            if (stored) {
                AppState.feedPosts = JSON.parse(stored);
            } else {
                AppState.feedPosts = MockData.generatePosts();
                // Save initial posts to storage so that likes/comments persist across
                // page reloads.  Without a backend, localStorage acts as a simple
                // persistence layer.
                localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(AppState.feedPosts));
            }
        } catch (e) {
            console.warn('Could not load posts from storage:', e);
            AppState.feedPosts = MockData.generatePosts();
        }
        FeedManager.render();
        FeedManager.bindEvents();
    },
    
    render: () => {
        const container = document.getElementById('feed-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        AppState.feedPosts.forEach((post, index) => {
            const postElement = FeedManager.createPostElement(post);
            container.appendChild(postElement);
            
            // Animate in with stagger
            setTimeout(() => {
                Animations.fadeInUp(postElement);
            }, index * 100);
        });
    },
    
    createPostElement: (post) => {
        const postDiv = DOM.createElement('div', 'post-card card-glass rounded-xl p-4');
        // Render event section if present
        const eventSection = post.isEvent ? `
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-center mb-4">
                <h4 class="font-semibold mb-2">${post.eventData.title}</h4>
                <p class="text-sm mb-2">📅 ${post.eventData.date}</p>
                <p class="text-sm mb-3">🏆 ${post.eventData.prizes}</p>
                <button class="btn-primary px-6 py-2 rounded-lg text-sm" onclick="FeedManager.joinEvent('${post.id}')">Partecipa</button>
            </div>
        ` : '';
        const imageSection = post.image ? `
            <img src="${post.image}" class="w-full h-48 object-cover rounded-lg mb-4">
        ` : '';
        // Determine relative time
        const relTime = post.createdAt ? timeAgo(post.createdAt) : post.timestamp || '';
        postDiv.innerHTML = `
            <div class="flex items-start space-x-3 mb-3">
                <img src="${post.avatar}" class="w-10 h-10 rounded-full object-cover">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <h3 class="font-semibold">${post.author}</h3>
                        <span class="text-xs text-gray-400">${relTime}</span>
                        <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">${post.category}</span>
                    </div>
                    <p class="text-sm text-gray-300 mt-1">Appassionato di VR</p>
                </div>
            </div>
            <div class="mb-4">
                <p class="mb-3">${post.content}</p>
                ${imageSection}
                ${eventSection}
            </div>
            <div class="flex items-center justify-between text-sm text-gray-400">
                <div class="flex space-x-4">
                    <button class="flex items-center space-x-1 hover:text-green-400" onclick="FeedManager.likePost(event, '${post.id}')">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>${post.likes}</span>
                    </button>
                    <button class="flex items-center space-x-1 hover:text-blue-400" onclick="FeedManager.commentPost('${post.id}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <span>${post.comments || 0}</span>
                    </button>
                    <button class="flex items-center space-x-1 hover:text-purple-400" onclick="FeedManager.sharePost('${post.id}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                        </svg>
                        <span>${post.shares}</span>
                    </button>
                </div>
                <button class="hover:text-yellow-400" onclick="FeedManager.savePost('${post.id}')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                    </svg>
                </button>
            </div>
        `;
        return postDiv;
    },
    
    bindEvents: () => {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.textContent.toLowerCase();
                AppState.filters.category = category === 'tutti' ? 'all' : category;
                FeedManager.filterPosts();
            });
        });
        
        // Search functionality
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                AppState.filters.searchQuery = e.target.value.toLowerCase();
                FeedManager.filterPosts();
            });
        }
        
        // Floating action button
        const fab = document.querySelector('.floating-action');
        if (fab) {
            fab.addEventListener('click', () => {
                FeedManager.createNewPost();
            });
        }
    },
    
    filterPosts: () => {
        let filteredPosts = MockData.generatePosts();
        
        // Filter by category
        if (AppState.filters.category !== 'all') {
            filteredPosts = filteredPosts.filter(post => 
                post.category.toLowerCase().includes(AppState.filters.category)
            );
        }
        
        // Filter by search query
        if (AppState.filters.searchQuery) {
            filteredPosts = filteredPosts.filter(post =>
                post.content.toLowerCase().includes(AppState.filters.searchQuery) ||
                post.author.toLowerCase().includes(AppState.filters.searchQuery)
            );
        }
        
        AppState.feedPosts = filteredPosts;
        FeedManager.render();
    },
    
    // Post interaction methods
    likePost: (evt, postId) => {
        const post = AppState.feedPosts.find(p => String(p.id) === String(postId));
        if (!post) return;
        // Toggle like: if not liked, increment; else decrement
        post.liked = !post.liked;
        if (post.liked) {
            post.likes = (post.likes || 0) + 1;
        } else {
            post.likes = Math.max(0, (post.likes || 1) - 1);
        }
        // Update UI
        const button = evt.currentTarget;
        const span = button.querySelector('span');
        if (span) span.textContent = post.likes;
        // Persist posts to localStorage
        try {
            localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(AppState.feedPosts));
        } catch (e) {
            console.warn('Could not save posts to storage:', e);
        }
        DOM.showToast(post.liked ? 'Mi piace aggiunto! ❤️' : 'Mi piace rimosso');
        Animations.pulseScale(button);
    },
    
    commentPost: (postId) => {
        const post = AppState.feedPosts.find(p => String(p.id) === String(postId));
        if (!post) return;
        CommentsManager.open(post);
    },
    
    sharePost: (postId) => {
        DOM.showToast('Post condiviso! 📤');
    },
    
    savePost: (postId) => {
        // Toggle the saved flag on the post
        const postIndex = AppState.feedPosts.findIndex(p => String(p.id) === String(postId));
        if (postIndex !== -1) {
            const post = AppState.feedPosts[postIndex];
            post.saved = !post.saved;
            // Persist to storage
            try {
                localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(AppState.feedPosts));
            } catch (e) {
                console.warn('Could not save posts to storage:', e);
            }
        }
        DOM.showToast('Post salvato! 🔖');
    },
    
    joinEvent: (postId) => {
        DOM.showToast('Iscrizione confermata! 🎉');
    },
    
    createNewPost: () => {
        DOM.showModal('Crea Nuovo Post', `
            <div class="space-y-4">
                <select class="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-green-400 outline-none">
                    <option>Meta Quest</option>
                    <option>PSVR2</option>
                    <option>PC VR</option>
                    <option>Generale</option>
                </select>
                <textarea class="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-green-400 outline-none" 
                          rows="4" placeholder="Cosa vuoi condividere con la community?"></textarea>
                <div class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="text-gray-400">Carica immagine o video</p>
                </div>
            </div>
        `, [
            { text: 'Pubblica', class: 'btn-primary' }
        ]);
    }
};

// Navigation management
const Navigation = {
    init: () => {
        Navigation.bindEvents();
        Navigation.setActivePage();
    },
    
    bindEvents: () => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                Navigation.navigateTo(href);
            });
        });
    },
    
    navigateTo: (url) => {
        // Add loading animation
        anime({
            targets: 'body',
            opacity: [1, 0.8],
            duration: 200,
            complete: () => {
                window.location.href = url;
            }
        });
    },
    
    setActivePage: () => {
        const currentPath = window.location.pathname;
        const page = currentPath.split('/').pop().replace('.html', '') || 'index';
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[href="${currentPath.split('/').pop() || 'index.html'}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components
    Navigation.init();
    
    // Initialize page-specific functionality
    const currentPath = window.location.pathname;
    const page = currentPath.split('/').pop().replace('.html', '') || 'index';
    
    switch (page) {
        case 'index':
        case '':
            FeedManager.init();
            // Update stats for members, events and deals
            StatsManager.load();
            break;
        case 'events':
            // EventsManager.init();
            StatsManager.load();
            break;
        case 'deals':
            // DealsManager.init();
            StatsManager.load();
            break;
        case 'profile':
            // ProfileManager.init();
            break;
        case 'friends':
            // FriendsManager.init();
            break;
    }
    
    // Add smooth scrolling and interactions
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            if (!e.target.onclick) {
                Animations.pulseScale(e.target);
            }
        });
    });
    
    // Add loading states for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', (e) => {
            e.target.style.opacity = '0';
            anime({
                targets: e.target,
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
    });
    
    console.log('🥽 Oculandia VR - App initialized successfully!');
});

// Export for global access
window.OculandiaVR = {
    AppState,
    Animations,
    DOM,
    FeedManager,
    Navigation
};