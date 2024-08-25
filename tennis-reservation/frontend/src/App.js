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

  const halfHourSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
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
  

  const sendVerification = () => {
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+972' + formattedPhone.slice(1);
    }

    fetch('http://localhost:5000/send_verification', {
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

    fetch('http://localhost:5000/verify_code', {
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

    fetch('http://localhost:5000/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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
    fetch('http://localhost:5000/add_demo_reservation', {
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
              onChange={(e) => setStartTime(e.target.value)}
              required
            >
              <option value="" disabled>Select Start Time</option>
              {halfHourSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            >
              <option value="" disabled>Select End Time</option>
              {halfHourSlots.filter(slot => slot > startTime).map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <button type="submit">Make a Reservation</button>
          </form>
          <button onClick={addDemoReservation}>
            Add Demo Reservation
          </button>
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
