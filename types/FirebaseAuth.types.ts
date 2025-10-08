export interface AuthForms {
    email: string;
    password: string;
}

export interface RegisterFormData extends AuthForms {
    confirmPassword: string;
}