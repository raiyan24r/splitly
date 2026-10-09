import GroupController from './GroupController'
import AuditLogController from './AuditLogController'

const Admin = {
    GroupController: Object.assign(GroupController, GroupController),
    AuditLogController: Object.assign(AuditLogController, AuditLogController),
}

export default Admin