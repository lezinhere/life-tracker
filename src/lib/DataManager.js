export const DataManager = {
    // Use a prefix to avoid collisions
    PREFIX: 'life-tracker-',

    // Generic Get/Set
    getData: (key, defaultValue) => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = window.localStorage.getItem(DataManager.PREFIX + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage', error);
            return defaultValue;
        }
    },

    setData: (key, value) => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(DataManager.PREFIX + key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage', error);
        }
    },

    // Specific Data Handlers
    getTodos: () => DataManager.getData('todos', []),
    setTodos: (todos) => DataManager.setData('todos', todos),

    getHabits: () => DataManager.getData('habits', {}), // { '2023-10-27': { workout: true, water: false } }
    setHabits: (habits) => DataManager.setData('habits', habits),

    getExpenses: () => DataManager.getData('expenses', []),
    setExpenses: (expenses) => DataManager.setData('expenses', expenses),

    // Default Daily Habits Configuration
    getHabitConfig: () => DataManager.getData('habit-config', [
        { id: 'swalath', label: 'Swalath (5 times)', icon: 'Moon' },
        { id: 'workout', label: 'Workout', icon: 'Dumbbell' },
        { id: 'diet', label: 'Diet Consistency', icon: 'Salad' },
        { id: 'sleep', label: 'Good Sleep', icon: 'Bed' },
        { id: 'water', label: 'Drink Water', icon: 'Droplets' },
    ]),
    setHabitConfig: (config) => DataManager.setData('habit-config', config),

    // Custom Categories
    getCustomCategories: () => DataManager.getData('custom-categories', []),
    setCustomCategories: (categories) => DataManager.setData('custom-categories', categories),
};

export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};
