import SuperAdmin from "@/src/models/superAdmin.model";
import User from "@/src/models/user.model";

export const generateRefreshAndAccessToken = async (
    userId: string,
    role: string
): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
        if (role === "admin") {
            const user = await SuperAdmin.findById(userId).exec();
            if (!user) {
                console.error("Admin user not found.");
                return null;
            }

            const accessToken = user.getAccessToken();
            const refreshToken = user.getRefreshToken();

            user.refreshToken = refreshToken;
            await user.save();

            return { accessToken, refreshToken };
        } else if (role === "user") {
            const user = await User.findById(userId).exec();
            if (!user) {
                console.error("User not found.");
                return null;
            }

            const accessToken = user.getAccessToken();
            const refreshToken = user.getRefreshToken();

            user.refreshToken = refreshToken;
            await user.save();

            return { accessToken, refreshToken };
        } else {
            console.error("Invalid role provided:", role);
            return null;
        }
    } catch (error) {
        console.error("Error generating tokens:", error);
        return null;
    }
};