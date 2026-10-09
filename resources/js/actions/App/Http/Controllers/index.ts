import GroupController from './GroupController'
import ExpenseController from './ExpenseController'
import ExportController from './ExportController'
import MemberController from './MemberController'
import CommentController from './CommentController'
import PaymentController from './PaymentController'
import Admin from './Admin'
import Settings from './Settings'

const Controllers = {
    GroupController: Object.assign(GroupController, GroupController),
    ExpenseController: Object.assign(ExpenseController, ExpenseController),
    ExportController: Object.assign(ExportController, ExportController),
    MemberController: Object.assign(MemberController, MemberController),
    CommentController: Object.assign(CommentController, CommentController),
    PaymentController: Object.assign(PaymentController, PaymentController),
    Admin: Object.assign(Admin, Admin),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers