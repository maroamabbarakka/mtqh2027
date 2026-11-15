import { describe,expect,it } from 'vitest'
import { permissionsFor, type Assignment } from './types'
const assignment=(role:Assignment['role'],status:Assignment['status']='active'):Assignment=>({role,eventId:'mtqh-pinrang-2027',status})
describe('permission mapping',()=>{
  it('memberi branch admin akses submit tetapi bukan approve',()=>{const permissions=permissionsFor([assignment('branch_admin')]);expect(permissions.has('results:submit')).toBe(true);expect(permissions.has('results:approve')).toBe(false)})
  it('memberi contributor akses draft tetapi bukan publish',()=>{const permissions=permissionsFor([assignment('contributor')]);expect(permissions.has('news:write')).toBe(true);expect(permissions.has('news:publish')).toBe(false)})
  it('mengabaikan assignment suspended',()=>{expect(permissionsFor([assignment('event_admin','suspended')]).size).toBe(0)})
})
