# Team Management Module - Frontend Components Structure

## 1. Component Architecture

### 1.1 Component Hierarchy
```
App
├── Navigation
│   ├── TeamsDropdown (New)
│   └── TeamSwitcher (New)
├── Routes
│   ├── /teams
│   │   ├── TeamsPage (New)
│   │   │   ├── TeamList (New)
│   │   │   ├── TeamCard (New)
│   │   │   └── CreateTeamModal (New)
│   │   └── TeamDetailPage (New)
│   │       ├── TeamHeader (New)
│   │       ├── TeamTabs (New)
│   │       ├── TeamMembers (New)
│   │       ├── TeamBoards (New)
│   │       └── TeamSettings (New)
│   ├── /teams/:teamId/boards
│   │   └── TeamBoardPage (Enhanced)
│   └── /invitations/:token
│       └── InvitationPage (New)
```

## 2. New Components

### 2.1 TeamsDropdown
**Location:** `client/src/components/TeamsDropdown.js`
**Purpose:** Navigation dropdown to switch between teams

**Props:**
```javascript
{
  teams: Array, // User's teams
  currentTeam: Object, // Currently selected team
  onTeamSelect: Function, // Team selection handler
  onCreateTeam: Function // Create team handler
}
```

**Features:**
- Display user's teams with role badges
- Quick team switching
- Create team button
- Team statistics (member count, board count)

### 2.2 TeamSwitcher
**Location:** `client/src/components/TeamSwitcher.js`
**Purpose:** Persistent team selector in header

**Props:**
```javascript
{
  teams: Array,
  currentTeam: Object,
  onTeamChange: Function
}
```

### 2.3 TeamsPage
**Location:** `client/src/pages/TeamsPage.js`
**Purpose:** Main teams listing page

**State:**
```javascript
{
  teams: [],
  loading: boolean,
  error: string | null,
  showCreateModal: boolean,
  filters: {
    role: string,
    search: string
  }
}
```

**Features:**
- List all user teams
- Filter by role (owner, admin, member)
- Search teams
- Create team button
- Team statistics overview

### 2.4 TeamCard
**Location:** `client/src/components/TeamCard.js`
**Purpose:** Individual team card in list

**Props:**
```javascript
{
  team: {
    _id: string,
    name: string,
    description: string,
    avatar: string,
    role: string,
    stats: {
      memberCount: number,
      boardCount: number,
      taskCount: number
    },
    lastActive: string
  },
  onClick: Function
}
```

### 2.5 CreateTeamModal
**Location:** `client/src/components/CreateTeamModal.js`
**Purpose:** Modal for creating new team

**State:**
```javascript
{
  name: string,
  description: string,
  slug: string,
  loading: boolean,
  errors: {
    name: string,
    slug: string
  }
}
```

**Features:**
- Team name input with validation
- Slug auto-generation
- Description textarea
- Real-time slug availability check

### 2.6 TeamDetailPage
**Location:** `client/src/pages/TeamDetailPage.js`
**Purpose:** Team management dashboard

**Tabs:**
1. **Overview** - Team stats and activity
2. **Members** - Member management
3. **Boards** - Team boards
4. **Settings** - Team configuration

### 2.7 TeamHeader
**Location:** `client/src/components/TeamHeader.js`
**Purpose:** Team header with basic info and actions

**Props:**
```javascript
{
  team: Object,
  userRole: string,
  onEdit: Function,
  onLeave: Function,
  onDelete: Function
}
```

### 2.8 TeamTabs
**Location:** `client/src/components/TeamTabs.js`
**Purpose:** Tab navigation for team detail

**Props:**
```javascript
{
  activeTab: string,
  tabs: Array<{id: string, label: string, icon: Component}>,
  onTabChange: Function,
  userRole: string // Show/hide tabs based on role
}
```

### 2.9 TeamMembers
**Location:** `client/src/components/TeamMembers.js`
**Purpose:** Team member management

**State:**
```javascript
{
  members: Array,
  loading: boolean,
  showInviteModal: boolean,
  searchQuery: string,
  roleFilter: string
}
```

**Features:**
- Member list with roles
- Invite member functionality
- Role management (promote/demote)
- Remove member (with confirmation)
- Search and filter members

### 2.10 InviteMemberModal
**Location:** `client/src/components/InviteMemberModal.js`
**Purpose:** Modal for inviting new members

**State:**
```javascript
{
  email: string,
  role: 'member' | 'admin' | 'guest',
  message: string,
  loading: boolean,
  error: string
}
```

### 2.11 TeamBoards
**Location:** `client/src/components/TeamBoards.js`
**Purpose:** Display and manage team boards

**State:**
```javascript
{
  boards: Array,
  loading: boolean,
  showCreateBoardModal: boolean,
  filters: {
    visibility: string,
    archived: boolean
  }
}
```

**Features:**
- List team boards
- Create new team board
- Filter by visibility
- Board statistics
- Quick actions (view, edit, archive)

### 2.12 TeamSettings
**Location:** `client/src/components/TeamSettings.js`
**Purpose:** Team configuration

**State:**
```javascript
{
  settings: {
    allowMemberInvites: boolean,
    defaultMemberRole: string,
    boardCreationRestricted: boolean
  },
  loading: boolean,
  saving: boolean
}
```

### 2.13 InvitationPage
**Location:** `client/src/pages/InvitationPage.js`
**Purpose:** Accept team invitation

**State:**
```javascript
{
  invitation: Object | null,
  loading: boolean,
  accepting: boolean,
  error: string | null
}
```

## 3. Enhanced Existing Components

### 3.1 BoardSelector Enhancement
**Location:** `client/src/components/BoardSelector.js`

**Enhancements:**
- Filter boards by team
- Display team badge on team boards
- Separate personal and team boards

### 3.2 BoardForm Enhancement
**Location:** `client/src/components/BoardForm.js`

**New Fields:**
```javascript
{
  teamId: string | null, // Optional team association
  visibility: 'private' | 'team' | 'public'
}
```

### 3.3 TaskForm Enhancement
**Location:** `client/src/components/TaskForm.js`

**Enhancements:**
- Filter assignee dropdown by team members (if team board)
- Show team member avatars

## 4. Context & State Management

### 4.1 TeamContext
**Location:** `client/src/context/TeamContext.js`

**State:**
```javascript
{
  teams: Array,
  currentTeam: Object | null,
  loading: boolean,
  error: string | null
}
```

**Actions:**
```javascript
{
  setCurrentTeam: (teamId) => void,
  fetchTeams: () => Promise,
  createTeam: (teamData) => Promise,
  updateTeam: (teamId, updates) => Promise,
  deleteTeam: (teamId) => Promise,
  inviteMember: (teamId, email, role) => Promise,
  removeMember: (teamId, memberId) => Promise
}
```

### 4.2 Enhanced AuthContext
**Location:** `client/src/context/AuthContext.js`

**Add to user object:**
```javascript
user: {
  // Existing fields...
  teams: Array<{
    teamId: string,
    role: string,
    joinedAt: string
  }>
}
```

## 5. API Service Layer

### 5.1 TeamService
**Location:** `client/src/services/teamService.js`

**Methods:**
```javascript
const teamService = {
  // Team management
  getTeams: (filters) => Promise,
  getTeam: (teamId) => Promise,
  createTeam: (teamData) => Promise,
  updateTeam: (teamId, updates) => Promise,
  deleteTeam: (teamId) => Promise,
  
  // Member management
  getTeamMembers: (teamId, filters) => Promise,
  inviteMember: (teamId, email, role) => Promise,
  updateMemberRole: (teamId, memberId, role) => Promise,
  removeMember: (teamId, memberId) => Promise,
  leaveTeam: (teamId) => Promise,
  
  // Board management
  getTeamBoards: (teamId, filters) => Promise,
  createTeamBoard: (teamId, boardData) => Promise,
  
  // Invitations
  getPendingInvitations: () => Promise,
  acceptInvitation: (token) => Promise,
  cancelInvitation: (invitationId) => Promise,
  
  // Statistics
  getTeamStats: (teamId) => Promise
};

## 13. Test-Driven Development (TDD) Strategy

### 13.1 TDD Workflow for Team Management

**Red-Green-Refactor Cycle:**
1. **Write failing test** (Red)
2. **Implement minimal code** to pass test (Green)
3. **Refactor** code while keeping tests passing
4. **Repeat** for next requirement

### 13.2 Test Pyramid Structure

```
┌─────────────────┐
│   E2E Tests     │ (10%)
│   (Cypress)     │
├─────────────────┤
│ Integration     │ (20%)
│ Tests           │
├─────────────────┤
│ Unit Tests      │ (70%)
│ (Jest/Vitest)   │
└─────────────────┘
```

### 13.3 Unit Testing Examples

**TeamService Unit Tests:**
```javascript
// teamService.test.js
describe('TeamService', () => {
  let mockApi;
  
  beforeEach(() => {
    mockApi = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
  });
  
  test('getTeams fetches teams with filters', async () => {
    // Arrange
    const filters = { role: 'admin' };
    const expectedResponse = [{ id: '1', name: 'Team A' }];
    mockApi.get.mockResolvedValue({ data: expectedResponse });
    
    // Act
    const result = await teamService.getTeams(filters, mockApi);
    
    // Assert
    expect(mockApi.get).toHaveBeenCalledWith('/api/teams', { params: filters });
    expect(result).toEqual(expectedResponse);
  });
  
  test('createTeam validates required fields', async () => {
    // Arrange
    const invalidData = { description: 'No name' };
    
    // Act & Assert
    await expect(teamService.createTeam(invalidData, mockApi))
      .rejects.toThrow('Team name is required');
  });
});
```

**TeamContext Unit Tests:**
```javascript
// TeamContext.test.js
describe('TeamContext', () => {
  test('setCurrentTeam updates current team', () => {
    // Arrange
    const { result } = renderHook(() => useTeamContext());
    const team = { _id: '1', name: 'Team A' };
    
    // Act
    act(() => {
      result.current.setCurrentTeam(team);
    });
    
    // Assert
    expect(result.current.currentTeam).toEqual(team);
  });
});
```

### 13.4 Component Testing with Testing Library

**TeamsPage Component Tests:**
```javascript
// TeamsPage.test.js
describe('TeamsPage', () => {
  test('renders empty state when no teams', () => {
    // Arrange
    render(<TeamsPage />);
    
    // Assert
    expect(screen.getByText('No teams found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument();
  });
  
  test('displays team list when teams exist', async () => {
    // Arrange
    const mockTeams = [
      { _id: '1', name: 'Team A', role: 'owner' },
      { _id: '2', name: 'Team B', role: 'member' }
    ];
    
    // Mock API call
    jest.spyOn(teamService, 'getTeams').mockResolvedValue(mockTeams);
    
    // Act
    render(<TeamsPage />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument();
      expect(screen.getByText('Team B')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
    });
  });
  
  test('opens create team modal on button click', () => {
    // Arrange
    render(<TeamsPage />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Create Team' }));
    
    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Team Name')).toBeInTheDocument();
  });
});
```

### 13.5 Integration Testing Examples

**Team Creation Flow Integration Test:**
```javascript
// teamCreation.integration.test.js
describe('Team Creation Flow', () => {
  test('complete team creation workflow', async () => {
    // 1. Navigate to teams page
    render(<App />);
    fireEvent.click(screen.getByText('Teams'));
    
    // 2. Click create team button
    fireEvent.click(screen.getByRole('button', { name: 'Create Team' }));
    
    // 3. Fill team form
    fireEvent.change(screen.getByLabelText('Team Name'), {
      target: { value: 'New Team' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Team description' }
    });
    
    // 4. Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    
    // 5. Verify team appears in list
    await waitFor(() => {
      expect(screen.getByText('New Team')).toBeInTheDocument();
    });
    
    // 6. Verify success notification
    expect(screen.getByText('Team created successfully')).toBeInTheDocument();
  });
});
```

### 13.6 E2E Testing with Cypress

**Team Management E2E Tests:**
```javascript
// cypress/e2e/team-management.cy.js
describe('Team Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/teams');
  });
  
  it('creates a new team', () => {
    cy.get('[data-testid="create-team-btn"]').click();
    cy.get('[data-testid="team-name-input"]').type('Engineering Team');
    cy.get('[data-testid="team-description-input"]').type('Engineering department team');
    cy.get('[data-testid="create-team-submit"]').click();
    
    cy.contains('Engineering Team').should('be.visible');
    cy.contains('Team created successfully').should('be.visible');
  });
  
  it('invites team member', () => {
    cy.get('[data-testid="team-card"]').first().click();
    cy.get('[data-testid="members-tab"]').click();
    cy.get('[data-testid="invite-member-btn"]').click();
    
    cy.get('[data-testid="invite-email-input"]').type('newmember@example.com');
    cy.get('[data-testid="invite-role-select"]').select('member');
    cy.get('[data-testid="send-invitation-btn"]').click();
    
    cy.contains('Invitation sent').should('be.visible');
  });
});
```

### 13.7 Test Data Factories

**Test Data Factory Pattern:**
```javascript
// test/factories/teamFactory.js
export const createTeam = (overrides = {}) => ({
  _id: 'team_' + Math.random().toString(36).substr(2, 9),
  name: 'Test Team',
  description: 'Test team description',
  slug: 'test-team',
  ownerId: 'user_123',
  settings: {
    allowMemberInvites: true,
    defaultMemberRole: 'member',
    boardCreationRestricted: false
  },
  stats: {
    memberCount: 1,
    boardCount: 0,
    taskCount: 0
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createTeamMember = (overrides = {}) => ({
  _id: 'member_' + Math.random().toString(36).substr(2, 9),
  userId: 'user_' + Math.random().toString(36).substr(2, 9),
  email: 'test@example.com',
  role: 'member',
  joinedAt: new Date().toISOString(),
  ...overrides
});
```

### 13.8 Mock Service Layer

**API Mocking Strategy:**
```javascript
// test/mocks/server.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Team endpoints
  rest.get('/api/teams', (req, res, ctx) => {
    return res(
      ctx.json([
        { _id: '1', name: 'Team A', role: 'owner' },
        { _id: '2', name: 'Team B', role: 'member' }
      ])
    );
  }),
  
  rest.post('/api/teams', (req, res, ctx) => {
    const { name } = req.body;
    if (!name) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Team name is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({ _id: 'new_team', name, slug: name.toLowerCase().replace(/\s+/g, '-') })
    );
  }),
  
  // Invitation endpoints
  rest.post('/api/teams/:teamId/invitations', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        _id: 'invitation_123',
        email: req.body.email,
        role: req.body.role,
        status: 'pending'
      })
    );
  })
);
```

### 13.9 Test Coverage Goals

**Minimum Coverage Requirements:**
- **Unit Tests:** 80% coverage
- **Integration Tests:** 70% coverage
- **Critical Paths:** 100% coverage
- **Edge Cases:** All identified edge cases covered

**Coverage Categories:**
1. **Business Logic:** Team creation, member management, role-based access
2. **Validation:** Form validation, API request validation
3. **Error Handling:** API errors, network failures, permission errors
4. **UI Interactions:** User flows, form submissions, modal interactions
5. **State Management:** Context updates, optimistic updates

### 13.10 Continuous Testing Pipeline

**GitHub Actions Workflow:**
```yaml
name: Team Management Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test -- --coverage
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 14. Implementation Roadmap

### 14.1 Phase 1: Foundation (Week 1-2)
1. **Database Schema Updates**
   - Create Team model
   - Create TeamMember model
   - Create Invitation model
   - Update User model with team associations
   - Update Board model with teamId field

2. **Backend API Development**
   - Team CRUD endpoints
   - Team member management endpoints
   - Invitation endpoints
   - Update existing endpoints for team context

3. **Authentication & Authorization**
   - Team-based JWT claims
   - Role-based middleware
   - Team ownership validation

### 14.2 Phase 2: Core Features (Week 3-4)
1. **Frontend Context & Services**
   - TeamContext implementation
   - TeamService API layer
   - Enhanced AuthContext

2. **Team Management UI**
   - TeamsPage with team listing
   - TeamCard components
   - CreateTeamModal
   - TeamDetailPage skeleton

3. **Member Management**
   - TeamMembers component
   - InviteMemberModal
   - Role management UI

### 14.3 Phase 3: Integration (Week 5-6)
1. **Board Integration**
   - Team board creation
   - Board filtering by team
   - Team board permissions

2. **Task Integration**
   - Team member assignment
   - Team task visibility
   - Cross-team task management

3. **Navigation & UX**
   - TeamsDropdown navigation
   - TeamSwitcher component
   - Breadcrumb updates

### 14.4 Phase 4: Advanced Features (Week 7-8)
1. **Real-time Features**
   - Team activity feed
   - WebSocket notifications
   - Live member updates

2. **Advanced Permissions**
   - Custom role creation
   - Fine-grained permissions
   - Team settings management

3. **Analytics & Reporting**
   - Team performance metrics
   - Member activity tracking
   - Team health dashboard

### 14.5 Phase 5: Polish & Optimization (Week 9-10)
1. **Performance Optimization**
   - Code splitting
   - Data caching
   - Lazy loading

2. **Accessibility & i18n**
   - ARIA labels
   - Keyboard navigation
   - Translation setup

3. **Testing & Documentation**
   - Comprehensive test suite
   - API documentation
   - User guides

## 15. Success Metrics

### 15.1 Technical Metrics
- **Test Coverage:** >80% unit test coverage
- **API Response Time:** <200ms for team endpoints
- **Bundle Size Increase:** <100KB for team features
- **Zero Critical Bugs:** In production deployment

### 15.2 User Experience Metrics
- **Team Creation Time:** <30 seconds for new users
- **Member Invitation Success Rate:** >95%
- **User Satisfaction Score:** >4.5/5 for team features
- **Feature Adoption Rate:** >60% of active users

### 15.3 Business Metrics
- **Team Collaboration:** Increased task completion rate
- **User Retention:** Higher retention for team users
- **Product Stickiness:** More frequent usage patterns
- **Enterprise Readiness:** Ready for team-based pricing tiers

## 16. Risk Mitigation

### 16.1 Technical Risks
- **Data Migration Complexity:** Incremental migration with backward compatibility
- **Performance Impact:** Load testing with realistic team sizes
- **Security Vulnerabilities:** Penetration testing for team-based access control

### 16.2 User Adoption Risks
- **Feature Complexity:** Progressive disclosure and guided onboarding
- **Migration Friction:** Seamless migration for existing users
- **Training Requirements:** In-app tutorials and documentation

### 16.3 Timeline Risks
- **Scope Creep:** Strict MVP definition with phased rollout
- **Integration Challenges:** Early integration testing with existing features
- **Resource Constraints:** Prioritized implementation based on user value

## 17. Conclusion

The team management module extends the existing task-manager application with comprehensive team collaboration capabilities. Following a TDD approach ensures high code quality, maintainability, and reliability. The phased implementation roadmap allows for incremental delivery of value while managing complexity and risk.

Key success factors include:
1. **Seamless Integration:** Team features should feel native to existing workflows
2. **Performance:** Team operations must not degrade application performance
3. **Security:** Robust team-based access control and data isolation
4. **Usability:** Intuitive team management with minimal learning curve
5. **Scalability:** Support for teams of varying sizes and complexity

With this design and implementation plan, the team management module will transform the task-manager from an individual productivity tool into a powerful team collaboration platform.
```

### 5.2 Enhanced api.js
**Location:** `client/src/services/api.js`

**Add team endpoints:**
```javascript
const API_ENDPOINTS = {
  // Existing endpoints...
  
  // Team endpoints
  TEAMS: '/api/teams',
  TEAM: (teamId) => `/api/teams/${teamId}`,
  TEAM_MEMBERS: (teamId) => `/api/teams/${teamId}/members`,
  TEAM_BOARDS: (teamId) => `/api/teams/${teamId}/boards`,
  INVITATIONS: '/api/invitations',
  INVITATION_ACCEPT: (token) => `/api/invitations/${token}/accept`
};
```

## 6. Routing Structure

### 6.1 Route Configuration
**Location:** `client/src/App.js`

**New Routes:**
```javascript
const routes = [
  // Existing routes...
  
  // Team routes
  { path: '/teams', element: <TeamsPage />, protected: true },
  { path: '/teams/:teamId', element: <TeamDetailPage />, protected: true },
  { path: '/teams/:teamId/boards', element: <TeamBoardPage />, protected: true },
  { path: '/invitations/:token', element: <InvitationPage /> }
];
```

### 6.2 Route Guards
**Team access middleware:**
```javascript
const TeamRoute = ({ teamId, children }) => {
  const { teams } = useTeamContext();
  const team = teams.find(t => t._id === teamId);
  
  if (!team) {
    return <Navigate to="/teams" />;
  }
  
  return children;
};
```

## 7. UI/UX Design

### 7.1 Design System Additions

**Team Role Badges:**
```css
.badge-owner { background: #10B981; color: white; }
.badge-admin { background: #3B82F6; color: white; }
.badge-member { background: #6B7280; color: white; }
.badge-guest { background: #9CA3AF; color: white; }
```

**Team Avatar:**
- Default: Initials with gradient background
- Custom: Uploaded team logo

**Empty States:**
- No teams
- No team members
- No team boards
- No pending invitations

### 7.2 Responsive Design
- Mobile: Stacked layout, simplified actions
- Tablet: Two-column layout
- Desktop: Full dashboard with sidebar

## 8. Real-time Features (Future)

### 8.1 WebSocket Events
```javascript
// Subscribe to team events
socket.on('team:member_added', (data) => {
  // Update team members list
});

socket.on('team:board_created', (data) => {
  // Update team boards list
});

socket.on('team:invitation_accepted', (data) => {
  // Show notification
});
```

### 8.2 Team Activity Feed
- Member joins/leaves
- Board created/archived
- Task assignments
- Role changes

## 9. Testing Strategy

### 9.1 Component Tests
```javascript
// TeamsPage.test.js
describe('TeamsPage', () => {
  test('renders team list', () => {});
  test('filters teams by role', () => {});
  test('creates new team', () => {});
});

// TeamMembers.test.js
describe('TeamMembers', () => {
  test('displays member list', () => {});
  test('invites new member', () => {});
  test('updates member role', () => {});
  test('removes member with confirmation', () => {});
});
```

### 9.2 Integration Tests
- Team creation flow
- Member invitation flow
- Board creation in team
- Role-based access control

### 9.3 E2E Tests
- Complete team management workflow
- Cross-team data isolation
- Permission escalation/de-escalation

## 10. Performance Considerations

### 10.1 Code Splitting
```javascript
// Lazy load team components
const TeamsPage = React.lazy(() => import('./pages/TeamsPage'));
const TeamDetailPage = React.lazy(() => import('./pages/TeamDetailPage'));
```

### 10.2 Data Fetching Strategy
- Initial load: User teams (lightweight)
- Lazy load: Team details, members, boards
- Pagination: Team members, boards
- Caching: Team metadata, member lists

### 10.3 Optimistic Updates
```javascript
// Optimistic member addition
const [members, setMembers] = useState([]);
const addMemberOptimistically = (newMember) => {
  setMembers(prev => [...prev, { ...newMember, _id: 'temp', status: 'pending' }]);
  
  // Then make API call
  teamService.inviteMember(teamId, newMember.email, newMember.role)
    .then(actualMember => {
      // Replace temp member with actual
    })
    .catch(error => {
      // Remove temp member on error
    });
};
```

## 11. Accessibility

### 11.1 ARIA Labels
- Team role announcements
- Member action descriptions
- Board visibility indicators

### 11.2 Keyboard Navigation
- Tab through team list
- Enter to select team
- Escape to close modals
- Arrow keys for tab navigation

### 11.3 Screen Reader Support
- Team statistics announced
- Role changes announced
- Invitation status updates

## 12. Internationalization (Future)

### 12.1 Translation Keys
```javascript
const teamTranslations = {
  'team.role.owner': 'Owner',
  'team.role.admin': 'Admin',
  'team.role.member': 'Member',
  'team.role.guest': 'Guest',
  'team.visibility.private': 'Private',
  'team.visibility.team': 'Team',
  'team.visibility.public': 'Public'
};