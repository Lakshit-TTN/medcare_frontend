"use client"
import React from "react";
import "./contacts.css";

const EmergencyContact = () => {
  return (
    <div className="container">
      <h1 className="title">Emergency Contacts</h1>
      <p className="description">Quick access to urgent care numbers and emergency contacts.</p>
      
      <div className="section">
        <h2 className="subtitle">National Emergency Numbers</h2>
        <ul>
          <li><strong>Ambulance:</strong> 102</li>
          <li><strong>Fire Department:</strong> 101</li>
          <li><strong>Police:</strong> 100</li>
        </ul>
      </div>
      
      <div className="section">
        <h2 className="subtitle">Hospital Helplines</h2>
        <ul>
          <li><strong>City Hospital:</strong> 011 -23456789</li>
          <li><strong>General Health Helpline:</strong> 1800-123-456</li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencyContact;
