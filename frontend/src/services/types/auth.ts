/**
 * 
 * class User(CoreBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    hashed_password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
 * 
 */

export type User = {
  _id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

export type UserLoginResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
};

export type UserCreate = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};
