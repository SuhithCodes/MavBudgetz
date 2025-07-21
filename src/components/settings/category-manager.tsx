
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, Edit } from "lucide-react"

const initialCategories = [
  "Food & Drink",
  "Groceries",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Health",
  "Travel",
  "Personal Care",
  "Gifts"
]

export function CategoryManager() {
  const [categories, setCategories] = useState(initialCategories)
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editedName, setEditedName] = useState("")

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.map(c => c.toLowerCase()).includes(newCategory.trim().toLowerCase())) {
      setCategories([...categories, newCategory.trim()].sort())
      setNewCategory("")
    }
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    setCategories(categories.filter((c) => c !== categoryToDelete))
  }

  const handleStartEdit = (category: string) => {
    setEditingCategory(category)
    setEditedName(category)
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditedName("")
  }

  const handleSaveEdit = () => {
    if (editedName.trim() && editingCategory) {
      const updatedCategories = categories.map((c) =>
        c === editingCategory ? editedName.trim() : c
      )
      setCategories(updatedCategories.sort())
      handleCancelEdit()
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
        <CardDescription>
          Add, edit, or delete your custom expense categories.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Your Categories</Label>
          <div className="space-y-2 rounded-md border max-h-96 overflow-y-auto p-2">
            {categories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
              >
                {editingCategory === category ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
             {categories.length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">
                    No categories found. Add one below.
                </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="flex w-full items-center gap-2">
          <Input
            placeholder="Add new category..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button onClick={handleAddCategory}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
