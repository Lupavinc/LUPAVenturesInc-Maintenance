// app/admin/user-roles/page.jsx
import { contentfulServerClient } from "../../lib/contentful-server";
import RoleForm from "../../components/RoleForm";


export const dynamic = "force-dynamic";

export default async function AdminUserRolesPage() {
  const res = await contentfulServerClient.getEntries({
    content_type: "userRole",
    order: "fields.userId",
    locale: "en-US",
  });

  const users = res.items;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-10 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-4xl font-semibold mb-8 text-gray-800">User Role Maintenance</h1>

        {users.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="border px-4 py-4">User ID</th>
                  <th className="border px-4 py-4">Username</th>
                  <th className="border px-4 py-4">Name</th>
                  <th className="border px-4 py-4">Email</th>
                  <th className="border px-4 py-4 text-center">Set Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => {
                  const f = u.fields;
                  const id = u.sys.id;

                  return (
                    <tr key={id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-4 py-5">{f.userId}</td>
                      <td className="border px-4 py-5">{f.userName}</td>
                      <td className="border px-4 py-5">
                        {f.firstName} {f.lastName}
                      </td>
                      <td className="border px-4 py-5">{f.email}</td>
                      <td className="border px-4 py-5 text-center" colSpan={2}>
                      <div className="flex justify-center">
                        <RoleForm entryId={id} currentRole={f.role} />
                      </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
