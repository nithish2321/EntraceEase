import React from "react";
import { useNavigate } from "react-router-dom";

function RoleSelection({ onSelect }) {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    onSelect(role);
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f7fb',
      fontFamily:'sans-serif',
      color: '#374151',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem 2rem',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1f2a44',
        marginBottom: '1rem',
        textAlign: 'center',
      }}>
        Welcome to Third Party Vendor Common Entrance Test Booking Application
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: '#6b7280',
        marginBottom: '3rem',
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        Select your role to access tailored tools and manage your exam processes efficiently.
      </p>
      <div style={{
        display: 'flex',
        gap: '2rem',
        flexDirection: 'row',
        justifyContent: 'center',
        maxWidth: '1200px',
        flexWrap: 'nowrap',
      }}>
        <div
          onClick={() => handleRoleSelect("college")}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '2rem',
            width: '100%',
            maxWidth: '400px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#1f2a44',
            marginBottom: '1rem',
          }}>
            College Authority
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.5',
            marginBottom: '1.5rem',
          }}>
            Manage your institution's exam processes with ease.
          </p>
          <ul style={{
            listStyleType: 'none',
            padding: 0,
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              Book test centers and schedule exams
            </li>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              Upload student data via CSV
            </li>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              Assign test centers to students
            </li>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              View and manage student records
            </li>
          </ul>
          <button
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            Select Role
          </button>
        </div>

        <div
          onClick={() => handleRoleSelect("test-center")}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '2rem',
            width: '100%',
            maxWidth: '400px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#1f2a44',
            marginBottom: '1rem',
          }}>
            Test Center Manager
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.5',
            marginBottom: '1.5rem',
          }}>
            Oversee test center operations and bookings seamlessly.
          </p>
          <ul style={{
            listStyleType: 'none',
            padding: 0,
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              Update test center profile details
            </li>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              Manage available exam slots
            </li>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              View and edit booking history
            </li>
            <li style={{
              fontSize: '1rem',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4f46e5',
                borderRadius: '50%',
              }}></span>
              Monitor seat availability
            </li>
          </ul>
          <button
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            Select Role
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;