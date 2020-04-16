import validator from 'validator'

class SessionValidator {
  // function to put validations on username
  static username(username: string): boolean {
    return (
      validator.isAlphanumeric(username) &&
      validator.isLength(username, { min: 4, max: 20 })
    )
  }

  //   function to validate generic text fields
  static genericText(text: string): boolean {
    return validator.isLength(text, { min: 0 })
  }

  //   function to validate slus
  static slug(slug: string): boolean {
    return validator.isLength(slug, { min: 6 })
  }
}

export default SessionValidator