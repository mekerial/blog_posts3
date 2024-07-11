export type CreateUserModel = {
    login: string,
    password: string,
    email: string
}

export type UserEmailModel = {
    accountData: {
        login: string,
        password: string,
        email: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    }

}

export type CreateUserWithHash = {
    accountData: {
        login: string,
        passwordHash: string,
        passwordSalt: string,
        email: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    }
}

export type QueryUserInputModel = {
    sortBy?: string,
    sortDirection?: string,
    pageNumber?: number,
    pageSize?: number,
    searchLoginTerm?: string,
    searchEmailTerm?: string
}

export type ResendingEmailModel = {
    email: string
}

export type EmailConfirmationCode = {
    code: string
}
export type RecoveryPassword = {
    newPassword: string,
    recoveryCode: string,
}

export type AccessTokenModel = {
    accessToken: string
}