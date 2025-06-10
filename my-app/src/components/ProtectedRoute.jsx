import { Route } from "react-router"

const ProtectedRoute = ({ element, ...props }) => {
    if (true) {
        return <Route {...props} element={<Navigate to="/login" />} />
    }


    return <Route {...props} element={
        <Box></Box>
    }/>
}