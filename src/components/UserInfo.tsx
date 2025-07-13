interface Props {
  user: {
    id: number
    name: string
    email: string
    role: "ADMINISTRATOR" | "WAITER"
    active: boolean
  }
}

const UserInfo = ({ user }: Props) => {
  return (
    <section className="flex flex-col items-center">
      {user.role === "ADMINISTRATOR" ? (
        <svg
          className="stroke-primary size-16 stroke-[1.5] mb-1"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 21v-2a4 4 0 0 1 4 -4h2" />
          <path d="M22 16c0 4 -2.5 6 -3.5 6s-3.5 -2 -3.5 -6c1 0 2.5 -.5 3.5 -1.5c1 1 2.5 1.5 3.5 1.5z" />
          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        </svg>
      ) : (
        <svg
          className="stroke-primary size-16 stroke-[1.5] mb-1"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
          <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
        </svg>
      )}
      <h2 className="font-medium">{user.name}</h2>
      <p className="text-secondary-text text-sm">{user.email}</p>
    </section>
  )
}

export default UserInfo
