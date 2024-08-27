import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');  // Redirect to login if not logged in
      return;
    }
  
    fetch('https://tenniscourt-backend.onrender.com/reservations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.status === 401) {  // Check if unauthorized
          navigate('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [navigate]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="AdminPage">
      <header className="AdminPage-header">
        <h1>Admin - Reservations</h1>
      </header>
      <main>
        <section className="reservations-list">
          <h2>All Reservations</h2>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation._id}>
                  <td>{reservation.firstName}</td>
                  <td>{reservation.lastName}</td>
                  <td>{reservation.phone}</td>
                  <td>{reservation.email}</td>
                  <td>{reservation.date}</td>
                  <td>{reservation.startTime}</td>
                  <td>{reservation.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
