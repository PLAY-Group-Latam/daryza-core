export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md border border-gray-200 bg-white p-1.5">
                <img
                    src="/images/icon-daryza.png"
                    alt="Daryza logo"
                    className="size-6 rounded-sm object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Daryza Admin
                </span>
            </div>
        </>
    );
}
