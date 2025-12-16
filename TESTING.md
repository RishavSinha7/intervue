# Testing Guide - Live Polling System

## Pre-Test Checklist

- [ ] Backend server running on port 4000
- [ ] Frontend running on port 3000
- [ ] Multiple browser tabs/windows ready
- [ ] Console open for debugging (F12)

## Test Scenarios

### 1. Initial Setup Test

**Objective:** Verify application starts correctly

**Steps:**
1. Run `npm start` in root directory
2. Verify server starts on port 4000
3. Run `npm start` in client directory
4. Verify React app opens at localhost:3000
5. Check for console errors

**Expected Results:**
- ✅ Server shows "Live Polling Server Started"
- ✅ Frontend loads homepage
- ✅ No console errors

---

### 2. Teacher Dashboard Test

**Objective:** Test teacher interface and features

#### 2.1 Teacher Login
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Enter as Teacher"
3. Observe dashboard

**Expected Results:**
- ✅ Dashboard loads successfully
- ✅ "Connected" status visible
- ✅ "Create New Poll" button visible
- ✅ "Connected Students (0)" shows

#### 2.2 Create Poll
**Steps:**
1. Click "Create New Poll"
2. Enter question: "What is your favorite color?"
3. Enter options: Red, Blue, Green, Yellow
4. Set duration: 30 seconds
5. Click "Create Poll"

**Expected Results:**
- ✅ Form validates input
- ✅ Poll created successfully
- ✅ "Create New Poll" button disabled
- ✅ Warning message appears
- ✅ Results section shows poll question

#### 2.3 Invalid Poll Creation
**Steps:**
1. Try to create poll with:
   - Empty question
   - Only 1 option
   - Duration < 10 or > 300

**Expected Results:**
- ✅ Validation errors displayed
- ✅ Poll not created
- ✅ Clear error messages

---

### 3. Student Interface Test

**Objective:** Test student join and participation

#### 3.1 Student Join
**Steps:**
1. Open new tab: http://localhost:3000
2. Click "Enter as Student"
3. Enter name: "Alice"
4. Click "Join Session"

**Expected Results:**
- ✅ Redirects to poll room
- ✅ Welcome message shows "Welcome, Alice!"
- ✅ Connected status visible
- ✅ Teacher dashboard shows Alice in students list

#### 3.2 Invalid Name
**Steps:**
1. Try joining with:
   - Empty name
   - Single character
   - 50+ characters

**Expected Results:**
- ✅ Validation errors shown
- ✅ Cannot proceed
- ✅ Clear error messages

#### 3.3 Multiple Students
**Steps:**
1. Open 3 more tabs
2. Join as: Bob, Charlie, Diana
3. Check teacher dashboard

**Expected Results:**
- ✅ All students appear in teacher's list
- ✅ Count shows (4)
- ✅ All show as not answered

---

### 4. Poll Flow Test

**Objective:** Complete poll lifecycle

#### 4.1 Poll Reception (Student Side)
**Steps:**
1. As teacher, create poll
2. Check all student tabs

**Expected Results:**
- ✅ All students receive poll instantly
- ✅ Timer starts counting down
- ✅ All options visible
- ✅ Can select options

#### 4.2 Answer Submission
**Steps:**
1. As Alice, select "Red" and submit
2. As Bob, select "Blue" and submit
3. Check teacher dashboard
4. Check Alice's view

**Expected Results:**
- ✅ Answer submitted confirmation
- ✅ Alice sees "✓ Answer submitted!"
- ✅ Alice sees waiting message or results
- ✅ Teacher sees live results update
- ✅ Alice and Bob marked as "✓ Answered"

#### 4.3 Duplicate Answer Prevention
**Steps:**
1. As Alice, try to answer again
2. Refresh Alice's tab

**Expected Results:**
- ✅ Cannot select or submit again
- ✅ Shows results instead of poll

#### 4.4 Timer Expiration
**Steps:**
1. Create new poll
2. As Charlie, wait for timer to reach 0
3. Try to submit answer

**Expected Results:**
- ✅ Timer reaches 0:00
- ✅ Submit button disabled
- ✅ Shows "Time Expired"
- ✅ Poll auto-ends
- ✅ All see results

#### 4.5 All Students Answered
**Steps:**
1. Create new poll with 30s timer
2. All students answer within 10 seconds
3. Check poll status

**Expected Results:**
- ✅ Poll ends immediately when last student answers
- ✅ Timer cancelled
- ✅ All see final results
- ✅ Teacher can create new poll

---

### 5. Live Results Test

**Objective:** Verify real-time result updates

#### 5.1 Teacher View
**Steps:**
1. Create poll with options A, B, C, D
2. As students answer, watch teacher dashboard

**Expected Results:**
- ✅ Results update in real-time
- ✅ Vote counts increase
- ✅ Percentages recalculate
- ✅ Progress bars animate
- ✅ Total votes update

#### 5.2 Student View
**Steps:**
1. As student, submit answer
2. Wait for poll to end
3. Check results display

**Expected Results:**
- ✅ Results show after answering (if poll active)
- ✅ Full results show when poll ends
- ✅ Can see all vote distributions
- ✅ Percentages match teacher view

---

### 6. Student Management Test

**Objective:** Test student removal feature

#### 6.1 Remove Student
**Steps:**
1. As teacher, click X next to Alice
2. Confirm removal
3. Check Alice's tab

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Alice removed from list
- ✅ Alice's tab shows "removed" message
- ✅ Alice disconnected
- ✅ Count updates

#### 6.2 Removed Student Behavior
**Steps:**
1. As removed student, try to refresh
2. Try to perform actions

**Expected Results:**
- ✅ Shows kicked message
- ✅ Cannot participate
- ✅ Clear instructions

---

### 7. Poll Creation Restrictions Test

**Objective:** Verify poll creation logic

#### 7.1 Active Poll Restriction
**Steps:**
1. Create poll
2. Only 2 of 3 students answer
3. Try to create new poll

**Expected Results:**
- ✅ "Create New Poll" button disabled
- ✅ Warning message displayed
- ✅ Cannot create until all answer

#### 7.2 Enable After All Answer
**Steps:**
1. Last student answers
2. Check create button

**Expected Results:**
- ✅ Button becomes enabled
- ✅ Warning message disappears
- ✅ Can create new poll

#### 7.3 Enable After Timer Expires
**Steps:**
1. Create poll
2. Wait for timer to expire
3. Check create button

**Expected Results:**
- ✅ Button enabled after expiry
- ✅ Can create new poll

---

### 8. Chat Feature Test (BONUS)

**Objective:** Test real-time chat

#### 8.1 Open Chat
**Steps:**
1. As teacher, click chat button
2. As student, click chat button

**Expected Results:**
- ✅ Chat popup appears
- ✅ Smooth slide-up animation
- ✅ Empty state shows

#### 8.2 Send Messages
**Steps:**
1. Teacher sends: "Hello class"
2. Student sends: "Hello teacher"
3. Check both views

**Expected Results:**
- ✅ Messages appear in real-time
- ✅ Sender names correct
- ✅ Timestamps shown
- ✅ Own messages styled differently

#### 8.3 Chat Badge
**Steps:**
1. Close chat on student side
2. Teacher sends message
3. Check student's chat button

**Expected Results:**
- ✅ Badge appears with count
- ✅ Badge disappears when opened
- ✅ Scroll to latest message

---

### 9. Timer Behavior Test

**Objective:** Test timer functionality

#### 9.1 Timer States
**Steps:**
1. Create 60s poll
2. Observe timer colors as time progresses

**Expected Results:**
- ✅ Normal state (> 30s): Deep violet
- ✅ Warning state (15-30s): Blue-violet
- ✅ Critical state (< 15s): Blinking

#### 9.2 Timer Accuracy
**Steps:**
1. Create 30s poll
2. Use stopwatch to verify
3. Check expiration

**Expected Results:**
- ✅ Timer accurate within 1 second
- ✅ Expires at correct time
- ✅ All students see same time

---

### 10. Connection Management Test

**Objective:** Test connection handling

#### 10.1 Student Disconnect
**Steps:**
1. Student joins
2. Close student tab
3. Check teacher dashboard

**Expected Results:**
- ✅ Student removed from list
- ✅ Count decrements
- ✅ No errors

#### 10.2 New Student During Poll
**Steps:**
1. Create and start poll
2. New student joins
3. Check new student's view

**Expected Results:**
- ✅ New student sees current poll
- ✅ Timer shows remaining time
- ✅ Can participate

#### 10.3 Server Disconnect
**Steps:**
1. Stop server (Ctrl+C)
2. Check client behavior
3. Restart server

**Expected Results:**
- ✅ Clients show disconnect message
- ✅ Graceful error handling
- ✅ No crash

---

### 11. Responsive Design Test

**Objective:** Test mobile responsiveness

#### 11.1 Mobile View
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test iPhone 12 Pro
4. Test iPad

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ All elements visible
- ✅ Touch-friendly buttons
- ✅ No horizontal scroll

#### 11.2 Desktop View
**Steps:**
1. Test on various desktop sizes
2. Resize window

**Expected Results:**
- ✅ Grid layouts work correctly
- ✅ Two-column on wide screens
- ✅ Single-column on narrow

---

### 12. Edge Cases Test

**Objective:** Test unusual scenarios

#### 12.1 No Students
**Steps:**
1. Teacher creates poll
2. No students join
3. Wait for timer

**Expected Results:**
- ✅ Poll ends normally
- ✅ Results show 0 votes
- ✅ No errors

#### 12.2 All Same Answer
**Steps:**
1. All students select same option
2. Check results

**Expected Results:**
- ✅ 100% for one option
- ✅ 0% for others
- ✅ Displays correctly

#### 12.3 Long Text
**Steps:**
1. Try maximum length inputs
2. Check display

**Expected Results:**
- ✅ Text truncates or wraps properly
- ✅ No layout breaks
- ✅ Enforces max length

#### 12.4 Special Characters
**Steps:**
1. Use emoji, symbols in inputs
2. Submit and view

**Expected Results:**
- ✅ Characters display correctly
- ✅ No encoding issues
- ✅ No security issues

---

## Performance Tests

### Load Test
**Steps:**
1. Open 10+ student tabs
2. All join simultaneously
3. All answer poll

**Expected Results:**
- ✅ Server handles load
- ✅ Updates remain fast
- ✅ No lag or freeze

### Memory Test
**Steps:**
1. Create 10 polls consecutively
2. Check server memory
3. Check browser memory

**Expected Results:**
- ✅ No memory leaks
- ✅ Past polls stored in memory
- ✅ Reasonable memory usage

---

## Browser Compatibility

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected Results:**
- ✅ Works on all browsers
- ✅ Consistent appearance
- ✅ Same functionality

---

## Automated Testing Checklist

For future implementation:

### Unit Tests
- [ ] Redux reducers
- [ ] Socket event handlers
- [ ] Validation functions
- [ ] Timer calculations
- [ ] Result calculations

### Integration Tests
- [ ] Poll creation flow
- [ ] Answer submission flow
- [ ] Student management
- [ ] Real-time updates

### E2E Tests
- [ ] Complete user journey (teacher)
- [ ] Complete user journey (student)
- [ ] Multi-user scenarios

---

## Bug Report Template

```
**Bug Title:** 
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Environment:**
- Browser:
- OS:
- Version:

**Screenshots:**

**Console Errors:**
```

---

## Test Results Log

Create a test results document:

```
Date: __________
Tester: __________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Teacher Login | ✅ / ❌ | |
| Student Join | ✅ / ❌ | |
| Poll Creation | ✅ / ❌ | |
| ... | | |
```

---

## Success Criteria

All tests should:
- ✅ Complete without errors
- ✅ Show expected behavior
- ✅ Handle edge cases gracefully
- ✅ Provide clear user feedback
- ✅ Work across browsers
- ✅ Be responsive
- ✅ Be performant

---

**Testing Complete!** 🎉

If all tests pass, the application is ready for use.
