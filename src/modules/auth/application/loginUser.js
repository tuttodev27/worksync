export async function loginUser(repository, credentials) {
    if(!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
    }
    return  repository.login(credentials);
}