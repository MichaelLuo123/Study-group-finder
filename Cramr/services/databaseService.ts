// Mock database service for React Native (pg library doesn't work in RN)
// TODO: Replace with actual API calls to your backend server

// In-memory storage for testing (will be lost on app restart)
let mockUsers: any[] = [];

// Mock user signup function
export const signUpUser = async (userData: {
    fullName: string;
    email: string;
    password: string;
}) => {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const existingUser = mockUsers.find(user => user.email === userData.email);
        
        if (existingUser) {
            return {
                success: false,
                message: 'User with this email already exists'
            };
        }

        // Create new user (simplified - no ID, plain password)
        const newUser = {
            full_name: userData.fullName,
            email: userData.email,
            password: userData.password, // Plain text password (for testing only!)
            created_at: new Date().toISOString() // Current timestamp when user is created
        };

        // Add to mock database
        mockUsers.push(newUser);

        console.log('✅ Mock user created:', newUser);

        return {
            success: true,
            message: 'User registered successfully',
            userId: mockUsers.length.toString() // Use array index as simple ID
        };

    } catch (error) {
        console.error('Error during signup:', error);
        return {
            success: false,
            message: 'Failed to register user. Please try again.'
        };
    }
};

// Mock function to show all users
export const showAllUsers = async () => {
    console.log('\n📊 Mock Users in Database:');
    console.log('='.repeat(60));
    
    if (mockUsers.length === 0) {
        console.log('No users found in database');
    } else {
        mockUsers.forEach((user: any, index: number) => {
            console.log(`${index + 1}. ID: ${index + 1}`);
            console.log(`   Name: ${user.full_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: ${user.password}`);
            console.log(`   Created: ${user.created_at}`);
            console.log('   ' + '-'.repeat(40));
        });
    }
    
    console.log(`\n📈 Total users: ${mockUsers.length}`);
    return mockUsers;
};

// Mock test connection
export const testConnection = async () => {
    console.log('✅ Mock database connection successful');
    return true;
};

// Mock get user by email
export const getUserByEmail = async (email: string) => {
    return mockUsers.find(user => user.email === email) || null;
};

// Mock get user by username
export const getUserByUsername = async (username: string) => {
    return mockUsers.find(user => user.full_name === username) || null;
};

// TODO: Replace these mock functions with actual API calls:
/*
Example of how this should work with a real backend:

export const signUpUser = async (userData) => {
    try {
        const response = await fetch('https://your-backend.com/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
};
*/ 