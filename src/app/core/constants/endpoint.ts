export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout'
    },

    MENU: {
        GET_MENU_ITEMS: '/api/auth/menu',
    },

    USER: {
        ADMIN:{
            PERMISSONS: '/api/admin/permissions'
        },
        BDO: {
            BDO_LIST: '/api/bdo',
            BDO_CREATE: '/api/bdo',
            BDO_DETAILS: '/api/bdo',
            WALLET_DETAILS: '/api/bdo/wallet',
            TRANSACTION_HISTORY: '/api/bdo/wallet/transactions',
        },
        SUB_ADMIN: {
            SUB_ADMIN_LIST: '/api/admin/sub-admins',
            SUB_ADMIN_DETAILS: '/api/admin/sub-admins',
            SUB_ADMIN_CREATE: '/api/admin/sub-admin',
            SUB_ADMIN_UPDATE: '/api/admin/edit-sub-admin',
            // SUB_ADMIN_DELETE: '/api/admin/sub-admin-delete',
        }
    },
    PACKAGE: {
        PACKAGE_LIST: '/api/packages',
        ACTIVATE_PACKAGE: '/api/bdo/activation-request',
        REQUESTED_PACKAGE: '/api/bdo/activation-requests',
        BDO_PACKAGE_LIST: '/api/bdo/activation-requests/my',
    }
}
