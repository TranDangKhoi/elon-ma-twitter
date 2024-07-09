// This user name regex is used to validate the user name when the user signs up for an account
// The user name must be between 4 and 15 characters long and can only contain letters, numbers, and underscores. The user name cannot be all numbers.
export const REGEX_USERNAME = /^(?![0-9]+$)[A-Za-z0-9_]{4,15}$/;
