export async function registerUser(repository, user) {

 if(!user.name || !user.lastName || !user.email || !user.password || !user.confirmPassword|| !user.userType) {
    throw new Error("All fields are required must be completed");
 }
    if(!user.email.includes('@')) {
        throw new Error('Invalid email format');
    }
    if(user.password !== user.confirmPassword) {
        throw new Error('Passwords do not match');
    }
    return repository.register(user);

}
