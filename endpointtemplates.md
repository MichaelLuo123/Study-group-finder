### **Get All Events**
```typescript
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
    console.error('Backend URL not configured');
    setLoading(false);
    return;
  }

  fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`)
    .then(res => res.json())
    .then(data => {
      setEvents(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Failed to fetch events:', error);
      setLoading(false);
    });
}, []);
```

### **Get Specific Event**
```typescript
const [event, setEvent] = useState(null);
const [loading, setLoading] = useState(true);
const eventId = 'your-event-id'; // Replace with actual event ID

useEffect(() => {
  if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
    console.error('Backend URL not configured');
    setLoading(false);
    return;
  }

  fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${eventId}`)
    .then(res => res.json())
    .then(data => {
      setEvent(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Failed to fetch event:', error);
      setLoading(false);
    });
}, [eventId]);
```

### **Create New Event**
```typescript
const createEvent = async (eventData: any) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        class: eventData.class,
        date: eventData.date,
        tags: eventData.tags,
        capacity: eventData.capacity,
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      Alert.alert('Success', 'Event created!');
      return data;
    } else {
      Alert.alert('Error', data.error || 'Failed to create event');
    }
  } catch (error) {
    Alert.alert('Error', 'Network error. Please try again.');
  }
};
```

### **User Sign Up**
```typescript
const handleSignUp = async (userData: any) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (response.ok) {
      Alert.alert('Success', 'Account created successfully!');
    } else {
      Alert.alert('Error', data.error || 'Sign up failed');
    }
  } catch (error) {
    Alert.alert('Error', 'Network error. Please try again.');
  }
};
```

### **Get User Info by ID**
```typescript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const userId = 'your-user-id'; // Replace with actual user ID

useEffect(() => {
  if (!process.env.EXPO_PUBLIC_BACKEND_URL) {
    console.error('Backend URL not configured');
    setLoading(false);
    return;
  }

  fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${userId}`)
    .then(res => res.json())
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Failed to fetch user:', error);
      setLoading(false);
    });
}, [userId]);
```