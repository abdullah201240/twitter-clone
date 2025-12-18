import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

interface EditProfileModalProps {
    isEditOpen: boolean
    setIsEditOpen: (open: boolean) => void
    editData: {
        name: string
        bio: string
        location: string
        website: string
    }
    setEditData: (data: any) => void
    handleSaveProfile: () => void
    uploading: boolean
}

export function EditProfileModal({
    isEditOpen,
    setIsEditOpen,
    editData,
    setEditData,
    handleSaveProfile,
    uploading
}: EditProfileModalProps) {
    return (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                            value={editData.bio}
                            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                            placeholder="Tell us about yourself"
                            className="mt-1 resize-none"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                            value={editData.location}
                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                            placeholder="Your location"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Website</label>
                        <Input
                            value={editData.website}
                            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                            placeholder="https://example.com"
                            className="mt-1"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={uploading}>
                        {uploading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}