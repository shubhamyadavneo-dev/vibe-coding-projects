# Team Management Module - Low Level Design (LLD)

## 1. Data Models

### 1.1 Enhanced User Model (`models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'super-admin'], 
    default: 'user' 
  },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  skills: [{ type: String }],
  teams: [{ 
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    role: { type: String, enum: ['owner', 'admin', 'member', 'guest'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 1.2 Team Model (`models/Team.js`)
```javascript
const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100 
  },
  description: { 
    type: String, 
    maxlength: 500,
    default: '' 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  avatar: { type: String, default: '' },
  settings: {
    allowMemberInvites: { type: Boolean, default: true },
    defaultMemberRole: { 
      type: String, 
      enum: ['member', 'guest'], 
      default: 'member' 
    },
    boardCreationRestricted: { 
      type: Boolean, 
      default: false 
    }
  },
  stats: {
    memberCount: { type: Number, default: 1 },
    boardCount: { type: Number, default: 0 },
    taskCount: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
teamSchema.index({ ownerId: 1 });
teamSchema.index({ slug: 1 }, { unique: true });
teamSchema.index({ 'members.userId': 1 });
```

### 1.3 TeamMember Model (`models/TeamMember.js`)
```javascript
const teamMemberSchema = new mongoose.Schema({
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'member', 'guest'], 
    default: 'member',
    required: true 
  },
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending' 
  },
  joinedAt: { type: Date },
  lastActiveAt: { type: Date, default: Date.now },
  permissions: {
    canCreateBoard: { type: Boolean, default: true },
    canInviteMembers: { type: Boolean, default: false },
    canRemoveMembers: { type: Boolean, default: false },
    canEditTeamSettings: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Compound unique index
teamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });
teamMemberSchema.index({ userId: 1, status: 1 });
```

### 1.4 Enhanced Board Model (`models/Board.js`)
```javascript
// Add to existing Board schema
const boardSchema = new mongoose.Schema({
  // Existing fields...
  name: { type: String, required: true },
  description: { type: String, default: '' },
  columns: { type: [String], default: DEFAULT_COLUMNS },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // New team-related fields
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    default: null 
  },
  visibility: { 
    type: String, 
    enum: ['private', 'team', 'public'], 
    default: 'private' 
  },
  permissions: {
    canEdit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    canView: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Existing fields...
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for team boards
boardSchema.index({ teamId: 1, createdAt: -1 });
boardSchema.index({ createdBy: 1, teamId: 1 });
```

### 1.5 Invitation Model (`models/Invitation.js`)
```javascript
const invitationSchema = new mongoose.Schema({
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true 
  },
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'member', 'guest'], 
    default: 'member' 
  },
  token: { 
    type: String, 
    required: true,
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending' 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
invitationSchema.index({ teamId: 1, email: 1 }, { unique: true });
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## 2. Business Logic Services

### 2.1 TeamService (`services/TeamService.js`)
```javascript
class TeamService {
  async createTeam(userId, teamData) {
    // Generate unique slug
    // Create team with owner
    // Create TeamMember entry
    // Update user.teams array
    // Return team with member info
  }

  async getTeamWithMembers(teamId, userId) {
    // Verify user has access to team
    // Fetch team with populated members
    // Calculate member statistics
  }

  async updateTeam(teamId, userId, updateData) {
    // Verify user is team owner/admin
    // Update team fields
    // Handle slug uniqueness
  }

  async deleteTeam(teamId, userId) {
    // Verify user is team owner
    // Delete all team boards
    // Remove all team members
    // Delete team
  }

  async getTeamsForUser(userId, filters = {}) {
    // Fetch teams user belongs to
    // Apply filters (role, status)
    // Populate team stats
  }
}
```

### 2.2 TeamMemberService (`services/TeamMemberService.js`)
```javascript
class TeamMemberService {
  async inviteMember(teamId, inviterId, email, role) {
    // Check if user exists
    // Create invitation token
    // Send invitation email
    // Create TeamMember with pending status
  }

  async acceptInvitation(token, userId) {
    // Validate token
    // Update TeamMember status to active
    // Update user.teams array
    // Send notification to team
  }

  async updateMemberRole(teamId, adminId, memberId, newRole) {
    // Verify admin permissions
    // Update member role
    // Update permissions based on role
  }

  async removeMember(teamId, removerId, memberId) {
    // Verify remover permissions
    // Cannot remove owner
    // Remove TeamMember entry
    // Update user.teams array
    // Update team stats
  }

  async getTeamMembers(teamId, userId, filters = {}) {
    // Verify user has access
    // Fetch members with user details
    // Apply filters (role, status)
  }
}
```

### 2.3 BoardService Enhancement (`services/BoardService.js`)
```javascript
// Add team-related methods to existing BoardService
class BoardService {
  async createBoard(userId, boardData) {
    // Check if teamId provided
    // Verify user has permission to create board in team
    // Set visibility based on team
    // Create board
  }

  async getBoardsForUser(userId, filters = {}) {
    // Fetch personal boards
    // Fetch team boards user has access to
    // Merge and sort results
  }

  async getTeamBoards(teamId, userId) {
    // Verify user has access to team
    // Fetch boards with teamId
    // Apply visibility filters
  }

  async updateBoardPermissions(boardId, userId, permissions) {
    // Verify user is board owner or team admin
    // Update board permissions
  }
}
```

## 3. API Controllers

### 3.1 Team Controller (`controllers/teamController.js`)
```javascript
const TeamService = require('../services/TeamService');

const teamController = {
  createTeam: async (req, res) => {
    // Validate input
    // Call TeamService.createTeam
    // Return created team
  },

  getTeam: async (req, res) => {
    // Get teamId from params
    // Call TeamService.getTeamWithMembers
    // Return team data
  },

  updateTeam: async (req, res) => {
    // Validate update data
    // Call TeamService.updateTeam
    // Return updated team
  },

  deleteTeam: async (req, res) => {
    // Call TeamService.deleteTeam
    // Return success response
  },

  getUserTeams: async (req, res) => {
    // Get filters from query
    // Call TeamService.getTeamsForUser
    // Return teams list
  },

  getTeamStats: async (req, res) => {
    // Calculate team statistics
    // Return stats object
  }
};
```

### 3.2 Team Member Controller (`controllers/teamMemberController.js`)
```javascript
const TeamMemberService = require('../services/TeamMemberService');

const teamMemberController = {
  inviteMember: async (req, res) => {
    // Validate email and role
    // Call TeamMemberService.inviteMember
    // Return invitation details
  },

  acceptInvitation: async (req, res) => {
    // Get token from params
    // Call TeamMemberService.acceptInvitation
    // Return success response
  },

  getMembers: async (req, res) => {
    // Get teamId from params
    // Call TeamMemberService.getTeamMembers
    // Return members list
  },

  updateMemberRole: async (req, res) => {
    // Validate new role
    // Call TeamMemberService.updateMemberRole
    // Return updated member
  },

  removeMember: async (req, res) => {
    // Call TeamMemberService.removeMember
    // Return success response
  },

  leaveTeam: async (req, res) => {
    // Call TeamMemberService.removeMember (self)
    // Return success response
  }
};
```

## 4. Middleware

### 4.1 Team Authorization Middleware (`middleware/teamAuth.js`)
```javascript
const teamAuth = {
  isTeamOwner: async (req, res, next) => {
    // Check if user is team owner
    // Attach team to request
    // Proceed or deny
  },

  isTeamAdmin: async (req, res, next) => {
    // Check if user is team owner or admin
    // Proceed or deny
  },

  hasTeamAccess: async (req, res, next) => {
    // Check if user has any access to team
    // Proceed or deny
  },

  canManageMembers: async (req, res, next) => {
    // Check if user can manage team members
    // Based on role and team settings
  }
};
```

### 4.2 Board Permission Middleware (`middleware/boardPermissions.js`)
```javascript
const boardPermissions = {
  canViewBoard: async (req, res, next) => {
    // Check board visibility
    // Check team membership if team board
    // Check explicit permissions
  },

  canEditBoard: async (req, res, next) => {
    // Check if user is board creator
    // Check team role if team board
    // Check explicit edit permissions
  }
};
```

## 5. Database Migrations

### 5.1 Migration Scripts
```javascript
// 1. Add role field to users
db.users.updateMany(
  { role: { $exists: false } },
  { $set: { role: 'user' } }
);

// 2. Add teams array to users
db.users.updateMany(
  { teams: { $exists: false } },
  { $set: { teams: [] } }
);

// 3. Add teamId and visibility to boards
db.boards.updateMany(
  { teamId: { $exists: false } },
  { 
    $set: { 
      teamId: null,
      visibility: 'private'
    }
  }
);
```

## 6. Validation Schemas

### 6.1 Team Validation
```javascript
const teamValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    settings: Joi.object({
      allowMemberInvites: Joi.boolean(),
      defaultMemberRole: Joi.string().valid('member', 'guest'),
      boardCreationRestricted: Joi.boolean()
    })
  })
};
```

### 6.2 Invitation Validation
```javascript
const invitationValidation = {
  create: Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'member', 'guest').default('member')
  })
};
```

## 7. Error Handling

### 7.1 Custom Errors
```javascript
class TeamError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'TeamError';
    this.code = code;
  }
}

// Error codes
const TEAM_ERRORS = {
  NOT_FOUND: 'TEAM_NOT_FOUND',
  ACCESS_DENIED: 'TEAM_ACCESS_DENIED',
  MEMBER_EXISTS: 'MEMBER_ALREADY_EXISTS',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  OWNER_CANNOT_LEAVE: 'OWNER_CANNOT_LEAVE_TEAM'
};
```

## 8. Performance Optimizations

### 8.1 Database Indexes
```javascript
// Critical indexes for performance
db.teams.createIndex({ ownerId: 1, updatedAt: -1 });
db.teamMembers.createIndex({ teamId: 1, role: 1 });
db.teamMembers.createIndex({ userId: 1, status: 1 });
db.boards.createIndex({ teamId: 1, visibility: 1 });
db.invitations.createIndex({ email: 1, status: 1 });
```

### 8.2 Caching Strategy
```javascript
// Cache team data for 5 minutes
const teamCache = {
  get: (teamId) => redis.get(`team:${teamId}`),
  set: (teamId, data) => redis.setex(`team:${teamId}`, 300, JSON.stringify(data)),
  invalidate: (teamId) => redis.del(`team:${teamId}`)
};
```

## 9. Testing Strategy

### 9.1 Unit Tests
- TeamService: createTeam, updateTeam, deleteTeam
- TeamMemberService: inviteMember, acceptInvitation
- BoardService: team board creation, permissions

### 9.2 Integration Tests
- Team creation flow
- Member invitation and acceptance
- Team board access control
- Role-based permissions

### 9.3 API Tests
- Team endpoints with authentication
- Member management endpoints
- Error scenarios and validation