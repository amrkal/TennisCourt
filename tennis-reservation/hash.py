import bcrypt

def hash_password(password):
    # Generate a salt and hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password.decode('utf-8')

# Example usage
hashed_password = hash_password("Admin")
print(f"Hashed password for storage: {hashed_password}")
