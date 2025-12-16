/**
 * ChatPopup Component (BONUS)
 * Real-time chat using Socket.io with Participants tab
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../socket/socket';
import { toggleChat, addMessage } from '../../store/studentSlice';
import './chat.css';

function ChatPopup() {
  const dispatch = useDispatch();
  const { showChat, messages, name, isTeacher } = useSelector(state => state.student);
  const mySocketId = useSelector(state => state.student.socketId); // Get own socket ID
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'
  const [participants, setParticipants] = useState([]); // IDENTITY FIX: Fetch from server
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // IDENTITY FIX: Fetch participants from server when participants tab is shown
  useEffect(() => {
    if (showChat && activeTab === 'participants') {
      socket.emit('get_participants');
    }
  }, [showChat, activeTab]);

  // Listen for participants list updates
  useEffect(() => {
    const handleParticipantsList = (participantsList) => {
      setParticipants(participantsList);
    };

    socket.on('participants_list', handleParticipantsList);

    // Also refresh participants when students join or leave
    const refreshParticipants = () => {
      if (activeTab === 'participants') {
        socket.emit('get_participants');
      }
    };

    socket.on('student_joined', refreshParticipants);
    socket.on('student_left', refreshParticipants);
    socket.on('student_removed', refreshParticipants);

    return () => {
      socket.off('participants_list', handleParticipantsList);
      socket.off('student_joined', refreshParticipants);
      socket.off('student_left', refreshParticipants);
      socket.off('student_removed', refreshParticipants);
    };
  }, [activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // IDENTITY FIX: Only send message text, server determines sender identity
    const messageData = {
      message: message.trim()
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  const handleToggle = () => {
    dispatch(toggleChat());
  };

  /**
   * REUSED LOGIC: Same kick-out handler as TeacherDashboard
   * Uses the exact same socket event: 'remove_student'
   * This maintains consistency across the app
   */
  const handleKickOutStudent = (socketId, studentName) => {
    if (window.confirm(`Are you sure you want to kick out ${studentName}?`)) {
      // REUSE: Same socket event used in TeacherDashboard.jsx
      socket.emit('remove_student', socketId);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button className="chat-toggle-btn" onClick={handleToggle}>
        💬
        {messages.length > 0 && !showChat && (
          <span className="chat-badge">{messages.length}</span>
        )}
      </button>

      {/* Chat Popup */}
      {showChat && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="chat-tabs">
              <button
                className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </button>
              <button
                className={`chat-tab ${activeTab === 'participants' ? 'active' : ''}`}
                onClick={() => setActiveTab('participants')}
              >
                Participants
              </button>
            </div>
            <button className="chat-close-btn" onClick={handleToggle}>
              ✕
            </button>
          </div>

          {/* Chat Tab Content */}
          {activeTab === 'chat' && (
            <>
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="no-messages">No messages yet</p>
                ) : (
                  messages.map((msg) => {
                    // IDENTITY FIX: Use senderRole to determine message alignment
                    // Server provides: senderName, senderRole, senderSocketId
                    const isOwnMessage = msg.senderSocketId === mySocketId;
                    const isTeacherMessage = msg.senderRole === 'teacher';
                    
                    return (
                      <div
                        key={msg.id}
                        className={`chat-message ${
                          isTeacherMessage ? 'teacher-message' : 'student-message'
                        } ${
                          isOwnMessage ? 'own-message' : 'other-message'
                        }`}
                      >
                        <div className="message-sender">
                          {msg.senderName} {isTeacherMessage ? '(Teacher)' : ''}
                        </div>
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-input"
                  maxLength={200}
                />
                <button type="submit" className="chat-send-btn" disabled={!message.trim()}>
                  Send
                </button>
              </form>
            </>
          )}

          {/* Participants Tab Content */}
          {activeTab === 'participants' && (
            <div className="participants-content">
              <div className="participants-header">
                <span className="participants-count">
                  {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}
                </span>
              </div>
              
              {participants.length === 0 ? (
                <p className="no-participants">No participants yet</p>
              ) : (
                <div className="participants-list">
                  {participants.map((participant) => (
                    <div key={participant.socketId} className="participant-row">
                      <div className="participant-info">
                        <div className="participant-details">
                          <span className="participant-name">{participant.name}</span>
                          <span className="participant-role-label">
                            {participant.role === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                        </div>
                      </div>
                      {isTeacher && participant.role === 'student' && (
                        <button
                          className="btn-kick-out"
                          onClick={() => handleKickOutStudent(participant.socketId, participant.name)}
                          title={`Kick out ${participant.name}`}
                        >
                          Kick out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ChatPopup;
