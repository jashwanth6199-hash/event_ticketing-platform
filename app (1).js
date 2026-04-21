/**
 * EventHub - Static SPA Logic
 * LocalStorage Service, State Management, and UI Rendering
 */

// --- Data Service (LocalStorage) ---
const storage = {
    get: (key, fallback) => JSON.parse(localStorage.getItem(key)) || fallback,
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    
    // Initial Seed Data
    seed: () => {
        if (!localStorage.getItem('events')) {
            storage.set('events', [
                { id: '1', title: 'Global Tech Summit 2026', date: '2026-05-15', location: 'San Francisco, CA', description: 'Join industry leaders for a 3-day deep dive into AI, Web3, and the future of software.', price: 299, capacity: 500, ticketsSold: 120, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop', organizerId: 'org1' },
                { id: '2', title: 'Neon Nights Music Fest', date: '2026-06-20', location: 'Miami Beach, FL', description: 'Experience the ultimate electronic dance music festival with top DJs from around the world.', price: 150, capacity: 2000, ticketsSold: 850, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop', organizerId: 'org1' },
                { id: '3', title: 'Startup Pitch Showcase', date: '2026-04-10', location: 'New York, NY', description: 'Watch 20 promising startups pitch to top-tier investors. Great networking opportunity.', price: 0, capacity: 300, ticketsSold: 290, image: 'https://images.unsplash.com/photo-1475721025505-23126915f0ea?w=800&auto=format&fit=crop', organizerId: 'org2' }
            ]);
        }
        if (!localStorage.getItem('bookings')) storage.set('bookings', []);
        
        // Setup initial user if not exists
        if (!localStorage.getItem('currentUser')) {
            storage.set('currentUser', { id: 'user1', name: 'John Doe', role: 'attendee' }); // Roles: attendee, organizer
        }
    }
};

// --- State Management ---
const state = {
    user: null,
    events: [],
    bookings: [],
    
    init() {
        storage.seed();
        this.user = storage.get('currentUser');
        this.events = storage.get('events');
        this.bookings = storage.get('bookings');
    },
    
    login(role) {
        const id = role === 'organizer' ? 'org-admin' : 'user-'+Math.floor(Math.random()*1000);
        this.user = { id, name: role === 'organizer' ? 'Event Organizer' : 'Guest User', role };
        storage.set('currentUser', this.user);
        ui.renderNavbar();
        router.navigate(role === 'organizer' ? 'org-dashboard' : 'home');
    },
    
    logout() {
        this.user = { id: 'guest', name: 'Guest', role: 'guest' };
        storage.set('currentUser', this.user);
        ui.renderNavbar();
        router.navigate('home');
    },

    bookTicket(eventId, quantity) {
        const event = this.events.find(e => e.id === eventId);
        if(!event || event.capacity < event.ticketsSold + quantity) return false;
        
        event.ticketsSold += quantity;
        this.events = this.events.map(e => e.id === eventId ? event : e);
        storage.set('events', this.events);
        
        const newBooking = {
            id: 'bkg-' + Date.now(),
            eventId,
            userId: this.user.id,
            quantity,
            totalPrice: event.price * quantity,
            date: new Date().toISOString()
        };
        this.bookings.push(newBooking);
        storage.set('bookings', this.bookings);
        return true;
    },

    createEvent(eventData) {
        const newEvent = {
            id: 'evt-' + Date.now(),
            ...eventData,
            ticketsSold: 0,
            organizerId: this.user.id
        };
        this.events.unshift(newEvent);
        storage.set('events', this.events);
    }
};

// --- Router ---
const router = {
    currentRoute: 'home',
    currentParams: {},
    
    navigate(route, params = {}) {
        this.currentRoute = route;
        this.currentParams = params;
        ui.renderPage();
    }
};

// --- UI Rendering ---
const ui = {
    container: document.getElementById('app-container'),
    
    init() {
        state.init();
        this.renderNavbar();
        router.navigate('home');
    },
    
    renderNavbar() {
        const authSection = document.getElementById('auth-section');
        const navLinks = document.getElementById('nav-links');
        
        if (state.user && state.user.role !== 'guest') {
            authSection.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        ${state.user.name.charAt(0)}
                    </div>
                    <button onclick="state.logout()" class="text-sm font-medium text-slate-500 hover:text-slate-800">Logout</button>
                </div>
            `;
            
            if (state.user.role === 'organizer') {
                navLinks.innerHTML = `
                    <a href="#" onclick="router.navigate('home')" class="text-slate-600 hover:text-primary transition font-medium">Discover Events</a>
                    <a href="#" onclick="router.navigate('org-dashboard')" class="text-primary font-medium transition flex items-center gap-1"><i class="ph ph-squares-four"></i> Dashboard</a>
                `;
            } else {
                navLinks.innerHTML = `
                    <a href="#" onclick="router.navigate('home')" class="text-slate-600 hover:text-primary transition font-medium">Discover Events</a>
                    <a href="#" onclick="router.navigate('my-bookings')" class="text-slate-600 hover:text-primary transition font-medium flex items-center gap-1"><i class="ph ph-ticket"></i> My Tickets</a>
                `;
            }
        } else {
            authSection.innerHTML = `
                <button onclick="state.login('attendee')" class="text-sm font-medium text-slate-600 hover:text-primary px-3 py-2">Sign In</button>
                <button onclick="state.login('organizer')" class="text-sm font-bold btn-primary px-4 py-2 rounded-lg">Organizer Login</button>
            `;
            navLinks.innerHTML = `
                <a href="#" onclick="router.navigate('home')" class="text-slate-600 hover:text-primary transition font-medium">Discover Events</a>
            `;
        }
    },
    
    renderPage() {
        this.container.innerHTML = '';
        window.scrollTo(0,0);
        
        switch(router.currentRoute) {
            case 'home': return views.renderHome();
            case 'event': return views.renderEventDetails(router.currentParams.id);
            case 'my-bookings': return views.renderMyBookings();
            case 'org-dashboard': return views.renderOrgDashboard();
            case 'create-event': return views.renderCreateEvent();
            default: return views.renderHome();
        }
    },
    
    showModal(content) {
        document.getElementById('modal-root').innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="ui.closeModal()"></div>
                <div class="relative bg-white rounded-2xl shadow-xl w-11/12 max-w-lg p-6 animate-fade-in z-10 glass">
                    <button onclick="ui.closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
                        <i class="ph ph-x text-xl"></i>
                    </button>
                    ${content}
                </div>
            </div>
        `;
    },
    
    closeModal() {
        document.getElementById('modal-root').innerHTML = '';
    }
};

// --- Views ---
const views = {
    renderHome() {
        const eventsHtml = state.events.map(e => `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 card-hover cursor-pointer" onclick="router.navigate('event', {id: '${e.id}'})">
                <div class="h-48 w-full bg-slate-200 relative">
                    <img src="${e.image}" alt="${e.title}" class="w-full h-full object-cover"/>
                    <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 text-sm font-bold text-slate-800 rounded-full shadow">
                        ${e.price === 0 ? 'Free' : '$'+e.price}
                    </div>
                </div>
                <div class="p-5">
                    <div class="flex items-center text-primary text-sm font-semibold mb-2 gap-1 mb-2">
                        <i class="ph ph-calendar-blank"></i> ${new Date(e.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-1 leading-tight">${e.title}</h3>
                    <div class="flex items-center text-slate-500 text-sm gap-1">
                        <i class="ph ph-map-pin"></i> ${e.location}
                    </div>
                </div>
            </div>
        `).join('');

        ui.container.innerHTML = `
            <!-- Hero Section -->
            <div class="relative bg-slate-900 overflow-hidden py-20 lg:py-32">
                <div class="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop" class="w-full h-full object-cover opacity-20 object-center" />
                    <div class="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent"></div>
                </div>
                <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 animate-fade-in">
                        Find Your Next <br/> <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Unforgettable</span> Experience
                    </h1>
                    <p class="mt-4 text-xl text-slate-300 max-w-2xl animate-fade-in" style="animation-delay: 0.1s">
                        Discover exclusive events, book tickets seamlessly, and unlock memories that last a lifetime.
                    </p>
                </div>
            </div>

            <!-- Event Listing -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-slate-900">Trending Events</h2>
                        <p class="text-slate-500 mt-1">Book your spot before they sell out.</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${eventsHtml}
                </div>
            </div>
        `;
    },
    
    renderEventDetails(id) {
        const event = state.events.find(e => e.id === id);
        if(!event) return router.navigate('home');
        
        const available = event.capacity - event.ticketsSold;
        const progress = (event.ticketsSold / event.capacity) * 100;

        ui.container.innerHTML = `
            <div class="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
                <button onclick="router.navigate('home')" class="text-slate-500 hover:text-primary mb-6 flex items-center gap-1 font-medium transition">
                    <i class="ph ph-arrow-left"></i> Back to Events
                </button>
                
                <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row">
                    <!-- Image -->
                    <div class="md:w-3/5 h-[400px] md:h-auto relative">
                        <img src="${event.image}" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                            <h1 class="text-3xl md:text-4xl font-extrabold text-white leading-tight shadow-sm">${event.title}</h1>
                        </div>
                    </div>
                    
                    <!-- Details & Action -->
                    <div class="md:w-2/5 p-8 flex flex-col">
                        <div class="space-y-6 flex-grow">
                            <div class="flex items-center gap-4 text-slate-700 font-medium bg-slate-50 p-4 rounded-xl">
                                <i class="ph ph-calendar text-2xl text-primary"></i>
                                <div>
                                    <div class="text-xs text-slate-500 uppercase tracking-wider font-bold">Date & Time</div>
                                    <div>${new Date(event.date).toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</div>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-4 text-slate-700 font-medium bg-slate-50 p-4 rounded-xl">
                                <i class="ph ph-map-pin text-2xl text-primary"></i>
                                <div>
                                    <div class="text-xs text-slate-500 uppercase tracking-wider font-bold">Location</div>
                                    <div>${event.location}</div>
                                </div>
                            </div>

                            <div>
                                <h3 class="font-bold text-slate-900 mb-2">About this event</h3>
                                <p class="text-slate-600 leading-relaxed text-sm">${event.description}</p>
                            </div>
                            
                            <!-- Capacity meter -->
                            <div>
                                <div class="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>Tickets Available</span>
                                    <span>${available} / ${event.capacity}</span>
                                </div>
                                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div class="h-2 rounded-full ${progress > 90 ? 'bg-red-500' : 'bg-primary'}" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <div class="text-sm text-slate-500 font-medium">Price</div>
                                <div class="text-3xl font-extrabold text-slate-900">${event.price === 0 ? 'Free' : '$'+event.price}</div>
                            </div>
                            <button onclick="actions.openBookingModal('${event.id}')" class="btn-primary px-8 py-4 rounded-xl font-bold tracking-wide shadow-lg ${available === 0 ? 'opacity-50 cursor-not-allowed hidden' : ''}" ${available === 0 ? 'disabled' : ''}>
                                ${available === 0 ? 'Sold Out' : 'Book Now'}
                            </button>
                            ${available === 0 ? '<div class="text-red-500 font-bold px-6 py-3 cursor-not-allowed">SOLD OUT</div>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderMyBookings() {
        if (!state.user || state.user.role === 'guest') return ui.renderPage(router.navigate('home'));
        
        const userBookings = state.bookings.filter(b => b.userId === state.user.id);
        
        let bookingsHtml = userBookings.length === 0 
            ? `<div class="text-center py-20"><div class="text-slate-400 mb-4"><i class="ph ph-ticket text-6xl"></i></div><h3 class="text-xl font-bold text-slate-900">No tickets yet</h3><p class="text-slate-500 mt-2 mb-6">Discover amazing events and book your spot.</p><button onclick="router.navigate('home')" class="btn-primary px-6 py-2 rounded-lg font-bold">Discover Events</button></div>`
            : userBookings.map(b => {
                const event = state.events.find(e => e.id === b.eventId);
                if (!event) return '';
                return `
                    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm">
                        <div class="sm:w-48 h-32 sm:h-auto bg-slate-100">
                            <img src="${event.image}" class="w-full h-full object-cover grayscale-[20%]" />
                        </div>
                        <div class="p-6 flex-grow flex flex-col justify-between">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="font-bold text-lg text-slate-900">${event.title}</h3>
                                    <div class="text-sm text-slate-500 flex items-center gap-1 mt-1"><i class="ph ph-calendar"></i> ${new Date(event.date).toLocaleDateString()} &middot; ${event.location}</div>
                                </div>
                                <div class="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs border border-primary/20">
                                    Confirmed
                                </div>
                            </div>
                            <div class="flex gap-6 mt-4 pt-4 border-t border-slate-100">
                                <div>
                                    <div class="text-xs text-slate-400 uppercase font-bold">Quantity</div>
                                    <div class="font-semibold text-slate-800">${b.quantity} Tickets</div>
                                </div>
                                <div>
                                    <div class="text-xs text-slate-400 uppercase font-bold">Total Paid</div>
                                    <div class="font-semibold text-slate-800">$${b.totalPrice}</div>
                                </div>
                                <div>
                                    <div class="text-xs text-slate-400 uppercase font-bold">Booking ID</div>
                                    <div class="font-semibold text-slate-800 font-mono text-sm">${b.id.split('-')[1].substring(0,8)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        ui.container.innerHTML = `
            <div class="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
                <h1 class="text-3xl font-extrabold text-slate-900 mb-8"><i class="ph ph-ticket text-primary"></i> My Bookings</h1>
                <div class="space-y-6">
                    ${bookingsHtml}
                </div>
            </div>
        `;
    },

    renderOrgDashboard() {
        if (!state.user || state.user.role !== 'organizer') return router.navigate('home');

        const orgEvents = state.events.filter(e => e.organizerId === state.user.id);
        const totalRevenue = orgEvents.reduce((acc, e) => acc + (e.price * e.ticketsSold), 0);
        const totalTickets = orgEvents.reduce((acc, e) => acc + e.ticketsSold, 0);

        const eventsList = orgEvents.length === 0 
            ? `<div class="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300"><p class="text-slate-500">No events created yet.</p></div>`
            : orgEvents.map(e => `
                <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm mb-3">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden">
                            <img src="${e.image}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900">${e.title}</h4>
                            <div class="text-xs text-slate-500">${new Date(e.date).toLocaleDateString()} &middot; ${e.location}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-8 text-sm">
                        <div class="text-center">
                            <div class="text-xs text-slate-400 uppercase font-bold">Sold</div>
                            <div class="font-bold text-slate-800">${e.ticketsSold} / ${e.capacity}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xs text-slate-400 uppercase font-bold">Revenue</div>
                            <div class="font-bold text-emerald-600">$${e.price * e.ticketsSold}</div>
                        </div>
                        <button class="text-slate-400 hover:text-primary transition p-2"><i class="ph ph-pencil-simple text-lg"></i></button>
                    </div>
                </div>
            `).join('');

        ui.container.innerHTML = `
            <div class="bg-slate-900 pt-12 pb-24 px-4">
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
                    <p class="text-slate-400">Welcome back! Here's how your events are performing.</p>
                </div>
            </div>
            
            <div class="max-w-6xl mx-auto px-4 -mt-16 pb-20 animate-fade-in">
                <!-- Stats Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between glass">
                        <div>
                            <div class="text-slate-500 text-sm font-medium mb-1">Total Revenue</div>
                            <div class="text-3xl font-extrabold text-slate-900">$${totalRevenue}</div>
                        </div>
                        <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <i class="ph ph-currency-dollar text-2xl font-bold"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between glass">
                        <div>
                            <div class="text-slate-500 text-sm font-medium mb-1">Tickets Sold</div>
                            <div class="text-3xl font-extrabold text-slate-900">${totalTickets}</div>
                        </div>
                        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <i class="ph ph-ticket text-2xl "></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between glass">
                        <div>
                            <div class="text-slate-500 text-sm font-medium mb-1">Active Events</div>
                            <div class="text-3xl font-extrabold text-slate-900">${orgEvents.length}</div>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <i class="ph ph-calendar text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center mb-6 mt-12">
                    <h2 class="text-2xl font-bold text-slate-900">Your Events</h2>
                    <button onclick="router.navigate('create-event')" class="btn-primary px-5 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow">
                        <i class="ph ph-plus-circle text-lg"></i> Create Event
                    </button>
                </div>
                
                <div>
                    ${eventsList}
                </div>
            </div>
        `;
    },

    renderCreateEvent() {
        if (!state.user || state.user.role !== 'organizer') return router.navigate('home');

        ui.container.innerHTML = `
            <div class="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
                <button onclick="router.navigate('org-dashboard')" class="text-slate-500 hover:text-primary mb-6 flex items-center gap-1 font-medium transition">
                    <i class="ph ph-arrow-left"></i> Back to Dashboard
                </button>
                
                <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h1 class="text-3xl font-extrabold text-slate-900 mb-8 border-b border-slate-100 pb-4">Create New Event</h1>
                    
                    <form id="create-event-form" class="space-y-6" onsubmit="actions.handleCreateEvent(event)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                                <input type="text" id="ce-title" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="e.g. Summer Music Fest">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Date</label>
                                <input type="date" id="ce-date" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Location</label>
                                <input type="text" id="ce-location" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="City, Venue">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Ticket Price ($)</label>
                                <input type="number" id="ce-price" min="0" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="0 for Free">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Total Capacity</label>
                                <input type="number" id="ce-capacity" min="1" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="e.g. 500">
                            </div>
                            
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                                <input type="url" id="ce-image" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="https://source.unsplash.com/...">
                            </div>
                            
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea id="ce-description" rows="4" required class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="Tell attendees what to expect..."></textarea>
                            </div>
                        </div>
                        
                        <div class="pt-6 flex justify-end border-t border-slate-100">
                            <button type="submit" class="btn-primary px-8 py-3 rounded-xl font-bold text-lg shadow">Publish Event</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};

// --- Actions (Handlers) ---
const actions = {
    openBookingModal(eventId) {
        if (!state.user || state.user.role === 'guest') {
            state.login('attendee'); // auto login for demo
        }
        
        const event = state.events.find(e => e.id === eventId);
        
        const modalHtml = `
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="ph-fill ph-ticket text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-slate-900">Book Tickets</h3>
                <p class="text-slate-500 text-sm mt-1">${event.title}</p>
            </div>
            
            <div class="space-y-4 mb-8">
                <div class="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="font-bold text-slate-700">Price per ticket</span>
                    <span class="font-bold text-slate-900">${event.price === 0 ? 'Free' : '$'+event.price}</span>
                </div>
                
                <div class="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="font-bold text-slate-700">Quantity</span>
                    <div class="flex items-center gap-3">
                        <button onclick="actions.updateQty(-1, ${event.price}, ${event.capacity - event.ticketsSold})" class="w-8 h-8 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-100 transition"><i class="ph ph-minus"></i></button>
                        <span id="booking-qty" class="font-bold text-lg w-6 text-center">1</span>
                        <button onclick="actions.updateQty(1, ${event.price}, ${event.capacity - event.ticketsSold})" class="w-8 h-8 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-100 transition"><i class="ph ph-plus"></i></button>
                    </div>
                </div>
                
                <div class="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/20 text-primary">
                    <span class="font-bold">Total Amount</span>
                    <span id="booking-total" class="font-extrabold text-xl">${event.price === 0 ? 'Free' : '$'+event.price}</span>
                </div>
            </div>
            
            <button onclick="actions.confirmBooking('${event.id}')" class="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow shadow-primary/30">
                Confirm Booking
            </button>
        `;
        
        ui.showModal(modalHtml);
    },
    
    updateQty(delta, price, maxQty) {
        const qtyEl = document.getElementById('booking-qty');
        const totalEl = document.getElementById('booking-total');
        
        let qty = parseInt(qtyEl.innerText) + delta;
        if(qty < 1) qty = 1;
        if(qty > maxQty) qty = maxQty;
        if(qty > 10) qty = 10; // max 10 per booking
        
        qtyEl.innerText = qty;
        totalEl.innerText = price === 0 ? 'Free' : '$' + (price * qty);
    },
    
    confirmBooking(eventId) {
        const qty = parseInt(document.getElementById('booking-qty').innerText);
        const success = state.bookTicket(eventId, qty);
        
        if (success) {
            ui.showModal(`
                <div class="text-center py-8">
                    <div class="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="ph-fill ph-check-circle text-5xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                    <p class="text-slate-500 mb-8">Your tickets have been sent to your email and saved in your account.</p>
                    <button onclick="ui.closeModal(); router.navigate('my-bookings')" class="btn-primary px-8 py-3 rounded-xl font-bold shadow">
                        View My Tickets
                    </button>
                </div>
            `);
        }
    },

    handleCreateEvent(e) {
        e.preventDefault();
        
        const eventData = {
            title: document.getElementById('ce-title').value,
            date: document.getElementById('ce-date').value,
            location: document.getElementById('ce-location').value,
            price: parseFloat(document.getElementById('ce-price').value),
            capacity: parseInt(document.getElementById('ce-capacity').value),
            image: document.getElementById('ce-image').value,
            description: document.getElementById('ce-description').value
        };
        
        state.createEvent(eventData);
        router.navigate('org-dashboard');
    }
};

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    ui.init();
});
