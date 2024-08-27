import React, { useState, useEffect } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';



function App() {
  
  const [reservations, setReservations] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);

  const hourSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00','13:00','14:00','15:00',
    '16:00','17:00','18:00','19:00',
    '20:00','21:00','22:00'
  ];

  const position = [33.260420, 35.770795];

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    return dates;
  };

  
  const weekDates = generateWeekDates();

/*useEffect(() => {
  fetch('http://localhost:5000/reservations', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error('Unexpected data format:', data);
        setReservations([]); // Default to empty array
      }
    })
    .catch(error => console.error('Error fetching reservations:', error));
}, []);*/
useEffect(() => {
  if (date) {
    fetch(`https://tenniscourt-backend.onrender.com/reservations?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        // Ensure the fetched data is an array
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format');
        }
        
        const bookedTimes = data.map(reservation => ({
          startTime: reservation.startTime,
          endTime: reservation.endTime,
        }));
        
        // Filter available start times
        const availableStartTimes = hourSlots.filter(slot => 
          !bookedTimes.some(reservation => 
            (slot >= reservation.startTime && slot < reservation.endTime)
          )
        );

        setAvailableTimes(availableStartTimes);
      })
      .catch(error => console.error('Error fetching reservations:', error));
  }
}, [date]);

const filterEndTimes = (start) => {
  return hourSlots.filter(slot =>
    slot > start &&
    !reservations.some(reservation => 
      (slot > reservation.startTime && start < reservation.endTime)
    )
  );
};


  const sendVerification = () => {
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+972' + formattedPhone.slice(1);
    }

    fetch('https://tenniscourt-backend.onrender.com/send_verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: formattedPhone }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert('Verification code sent!');
        setVerificationSent(true);
      } else {
        alert('Failed to send verification code. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error sending verification:', error);
      alert('Error occurred. Please check the console for more details.');
    });
  };

  const verifyCode = () => {
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+972' + formattedPhone.slice(1);
    }

    fetch('https://tenniscourt-backend.onrender.com/verify_code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: formattedPhone, code: otp }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert('Phone number verified!');
        setIsVerified(true);
      } else {
        alert('Invalid verification code. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error verifying code:', error);
      alert('Error occurred. Please check the console for more details.');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert('Please verify your phone number before making a reservation.');
      return;
    }
    const newReservation = { firstName, lastName, phone, email, date, startTime, endTime };

    fetch('https://tenniscourt-backend.onrender.com/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newReservation)
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        setReservations([...reservations, newReservation]);
        setFirstName('');
        setLastName('');
        setPhone('');
        setEmail('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setOtp('');
        setIsVerified(false);
        setVerificationSent(false);
      } else {
        alert('Reservation failed: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error creating reservation:', error);
      alert('Error occurred. Please check the console for more details.');
    });
  };


  const addDemoReservation = () => {
    fetch('https://tenniscourt-backend.onrender.com/add_demo_reservation', {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert('Demo reservation added!');
        setReservations([...reservations, {
          firstName: "John",
          lastName: "Doe",
          phone: "+972500000000",
          email: "john.doe@example.com",
          date: "2024-09-01",  // Same date as used in the backend
          startTime: "10:00",
          endTime: "11:00"
        }]);
      } else {
        alert('Failed to add demo reservation. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error adding demo reservation:', error);
      alert('Error occurred. Please check the console for more details.');
    });
  };


/*  useEffect(() => {
    if (date) {
      fetch(`https://tenniscourt-backend.onrender.com/reservations?date=${date}`, {
        method: 'GET',
      })
      .then(response => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const bookedTimes = data.map(reservation => reservation.startTime);
          const available = hourSlots.filter(slot => !bookedTimes.includes(slot));
          setAvailableTimes(available);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching reservations:', error);
        alert('Error fetching reservations. Please check your login status.');
      });
    }
  }, [date]);*/







  return (
    <div className="App">
      <header className="App-header">
        <h1>Tennis Playground Reservations</h1>
      </header>
      <main>
        <section className="reservation-form">
          <h2>Reserve Your Spot</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={sendVerification}
              disabled={verificationSent}
            >
              Send Verification Code
            </button>
            {verificationSent && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="button" onClick={verifyCode}>
                  Verify Code
                </button>
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={weekDates[0]}
              max={weekDates[6]}
            />
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setEndTime(''); // Reset end time when start time changes
              }}
              required
            >
              <option value="" disabled>Select Start Time</option>
              {availableTimes.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={!startTime} // Disable end time selection until start time is chosen
            >
              <option value="" disabled>Select End Time</option>
              {startTime && filterEndTimes(startTime).map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <button type="submit">Make a Reservation</button>
          </form>

          <div className="contact-info">
            <p>For payments and support, call: <strong>058-560-5002</strong></p>
          </div>
        </section>
        
        <section className="map-container-wrapper">
          <MapContainer center={position} zoom={13} className="map-container">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>
                Tennis Court Location
              </Popup>
            </Marker>
          </MapContainer>
        </section>
      </main>
      <footer className="App-footer">
        <p>&copy; 2024 Tennis Playground. All rights reserved.</p>
      </footer>
    </div>
  );
}

/*        <section className="reservations-list">
          <h2>Upcoming Reservations</h2>
          <ul>
          </ul>
        </section>*/

export default App;
