# Team Management Module - API Specifications

## 1. API Endpoints Overview

### Base URL: `/api/teams`

## 2. Team Management Endpoints

### 2.1 Create Team
**POST** `/api/teams`

**Request Body:**
```json
{
  "name": "Development Team",
  "description": "Frontend and backend developers",
  "slug": "dev-team" // optional, auto-generated if not provided
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "team_123",
    "name": "Development Team",
    "description": "Frontend and backend developers",
    "slug": "dev-team",
    "ownerId": "user_123",
    "avatar": "",
    "settings": {
      "allowMemberInvites": true,
      "defaultMemberRole": "member",
      "boardCreationRestricted": false
    },
    "stats": {
      "memberCount": 1,
      "boardCount": 0,
      "taskCount": 0
    },
    "createdAt": "2026-04-29T13:30:00.000Z",
    "updatedAt": "2026-04-29T13:30:00.000Z"
  }
}
```

### 2.2 Get User's Teams
**GET** `/api/teams`

**Query Parameters:**
- `role`: Filter by user role in team (owner, admin, member, guest)
- `status`: Filter by membership status (active, pending)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "_id": "team_123",
        "name": "Development Team",
        "description": "Frontend and backend developers",
        "slug": "dev-team",
        "avatar": "",
        "role": "owner",
        "stats": {
          "memberCount": 5,
          "boardCount": 3,
          "taskCount": 42
        },
        "lastActive": "2026-04-29T12:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 2.3 Get Team Details
**GET** `/api/teams/:teamId`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "team_123",
    "name": "Development Team",
    "description": "Frontend and backend developers",
    "slug": "dev-team",
    "ownerId": "user_123",
    "avatar": "",
    "settings": {
      "allowMemberInvites": true,
      "defaultMemberRole": "member",
      "boardCreationRestricted": false
    },
    "stats": {
      "memberCount": 5,
      "boardCount": 3,
      "taskCount": 42
    },
    "createdAt": "2026-04-29T13:30:00.000Z",
    "updatedAt": "2026-04-29T13:30:00.000Z"
  }
}
```

### 2.4 Update Team
**PUT** `/api/teams/:teamId`

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "description": "Updated description",
  "settings": {
    "allowMemberInvites": false,
    "boardCreationRestricted": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "team_123",
    "name": "Updated Team Name",
    "description": "Updated description",
    "slug": "dev-team",
    "settings": {
      "allowMemberInvites": false,
      "defaultMemberRole": "member",
      "boardCreationRestricted": true
    },
    "updatedAt": "2026-04-29T13:35:00.000Z"
  }
}
```

### 2.5 Delete Team
**DELETE** `/api/teams/:teamId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Team deleted successfully"
}
```

## 3. Team Member Endpoints

### 3.1 Get Team Members
**GET** `/api/teams/:teamId/members`

**Query Parameters:**
- `role`: Filter by role (owner, admin, member, guest)
- `status`: Filter by status (active, pending)
- `search`: Search by name or email
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "_id": "member_123",
        "userId": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "",
        "role": "owner",
        "status": "active",
        "joinedAt": "2026-04-29T13:30:00.000Z",
        "lastActiveAt": "2026-04-29T13:30:00.000Z",
        "permissions": {
          "canCreateBoard": true,
          "canInviteMembers": true,
          "canRemoveMembers": true,
          "canEditTeamSettings": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 3.2 Invite Member
**POST** `/api/teams/:teamId/members/invite`

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member" // admin, member, guest
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "invitationId": "invite_123",
    "email": "newmember@example.com",
    "role": "member",
    "status": "pending",
    "expiresAt": "2026-05-06T13:30:00.000Z",
    "invitedBy": "user_123"
  }
}
```

### 3.3 Accept Invitation
**POST** `/api/invitations/:token/accept`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teamId": "team_123",
    "teamName": "Development Team",
    "role": "member",
    "joinedAt": "2026-04-29T13:30:00.000Z"
  }
}
```

### 3.4 Update Member Role
**PUT** `/api/teams/:teamId/members/:memberId/role`

**Request Body:**
```json
{
  "role": "admin" // admin, member, guest
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "member_123",
    "role": "admin",
    "permissions": {
      "canCreateBoard": true,
      "canInviteMembers": true,
      "canRemoveMembers": true,
      "canEditTeamSettings": false
    }
  }
}
```

### 3.5 Remove Member
**DELETE** `/api/teams/:teamId/members/:memberId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Member removed from team"
}
```

### 3.6 Leave Team
**POST** `/api/teams/:teamId/leave`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "You have left the team"
}
```

## 4. Team Board Endpoints

### 4.1 Get Team Boards
**GET** `/api/teams/:teamId/boards`

**Query Parameters:**
- `visibility`: Filter by visibility (private, team, public)
- `archived`: Include archived boards (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "boards": [
      {
        "_id": "board_123",
        "name": "Sprint 15",
        "description": "Current sprint board",
        "teamId": "team_123",
        "visibility": "team",
        "columns": ["Backlog", "In Progress", "Done"],
        "stats": {
          "taskCount": 42,
          "completedTasks": 15
        },
        "createdBy": "user_123",
        "createdAt": "2026-04-29T13:30:00.000Z",
        "updatedAt": "2026-04-29T13:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "pages": 1
    }
  }
}
```

### 4.2 Create Team Board
**POST** `/api/teams/:teamId/boards`

**Request Body:**
```json
{
  "name": "New Team Board",
  "description": "Board for project X",
  "columns": ["Backlog", "In Progress", "Review", "Done"],
  "visibility": "team" // private, team, public
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "board_456",
    "name": "New Team Board",
    "description": "Board for project X",
    "teamId": "team_123",
    "visibility": "team",
    "columns": ["Backlog", "In Progress", "Review", "Done"],
    "createdBy": "user_123",
    "createdAt": "2026-04-29T13:30:00.000Z",
    "updatedAt": "2026-04-29T13:30:00.000Z"
  }
}
```

### 4.3 Update Board Visibility
**PUT** `/api/boards/:boardId/visibility`

**Request Body:**
```json
{
  "visibility": "public" // private, team, public
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "board_123",
    "visibility": "public",
    "updatedAt": "2026-04-29T13:35:00.000Z"
  }
}
```

## 5. Invitation Endpoints

### 5.1 Get Pending Invitations
**GET** `/api/invitations/pending`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "_id": "invite_123",
        "teamId": "team_123",
        "teamName": "Development Team",
        "invitedBy": "John Doe",
        "role": "member",
        "email": "user@example.com",
        "expiresAt": "2026-05-06T13:30:00.000Z",
        "createdAt": "2026-04-29T13:30:00.000Z"
      }
    ]
  }
}
```

### 5.2 Resend Invitation
**POST** `/api/invitations/:invitationId/resend`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitation resent successfully"
}
```

### 5.3 Cancel Invitation
**DELETE** `/api/invitations/:invitationId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invitation cancelled"
}
```

## 6. Statistics Endpoints

### 6.1 Get Team Statistics
**GET** `/api/teams/:teamId/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 5,
      "byRole": {
        "owner": 1,
        "admin": 1,
        "member": 2,
        "guest": 1
      },
      "activeLast7Days": 4
    },
    "boards": {
      "total": 3,
      "byVisibility": {
        "private": 1,
        "team": 2,
        "public": 0
      }
    },
    "tasks": {
      "total": 42,
      "byStatus": {
        "Backlog": 10,
        "In Progress": 15,
        "Done": 17
      }
    },
    "activity": {
      "tasksCreatedLast7Days": 12,
      "tasksCompletedLast7Days": 8
    }
  }
}
```

## 7. Error Responses

### 7.1 Common Error Format
```json
{
  "success": false,
  "error": {
    "code": "TEAM_ACCESS_DENIED",
    "message": "You don't have permission to access this team",
    "details": {}
  }
}
```

### 7.2 Error Codes
- `TEAM_NOT_FOUND`: Team does not exist
- `TEAM_ACCESS_DENIED`: User lacks permission
- `TEAM_SLUG_EXISTS`: Team slug already taken
- `MEMBER_ALREADY_EXISTS`: User already in team
- `INVITATION_EXPIRED`: Invitation has expired
- `INVITATION_INVALID`: Invalid invitation token
- `OWNER_CANNOT_LEAVE`: Team owner cannot leave
- `ROLE_UPDATE_DENIED`: Cannot update this role
- `BOARD_CREATION_DENIED`: Cannot create board in team

## 8. Authentication & Authorization

### 8.1 Required Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 8.2 Role-Based Access Matrix

| Endpoint | Owner | Admin | Member | Guest |
|----------|-------|-------|--------|-------|
| Create Team | ✓ | ✓ | ✓ | ✓ |
| Update Team | ✓ | ✓ | ✗ | ✗ |
| Delete Team | ✓ | ✗ | ✗ | ✗ |
| Invite Member | ✓ | ✓ | ✗ | ✗ |
| Remove Member | ✓ | ✓ | ✗ | ✗ |
| Update Member Role | ✓ | ✓ | ✗ | ✗ |
| Create Team Board | ✓ | ✓ | ✓ | ✗ |
| Update Board Visibility | ✓ | ✓ | ✗ | ✗ |

## 9. Rate Limiting

### 9.1 Rate Limits
- Team creation: 5 per hour per user
- Member invitations: 20 per hour per team
- API calls: 1000 per hour per user

### 9.2 Response Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1623456789
```

## 10. Webhook Events (Future)

### 10.1 Event Types
- `team.created`
- `team.member_added`
- `team.member_removed`
- `team.board_created`
- `team.invitation_sent`
- `team.invitation_accepted`

### 10.2 Webhook Payload
```json
{
  "event": "team.member_added",
  "teamId": "team_123",
  "userId": "user_456",
  "role": "member",
  "timestamp": "2026-04-29T13:30:00.000Z"
}
```

## 11. Testing Endpoints

### 11.1 Health Check
**GET** `/api/teams/health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-29T13:30:00.000Z",
  "version": "1.0.0"
}
```

### 11.2 Schema Validation
**POST** `/api/teams/validate`

**Request Body:**
```json
{
  "name": "Test Team",
  "description": "Test description"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "errors": []
}