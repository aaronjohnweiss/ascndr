import { Button, Modal } from 'react-bootstrap'
import { FaPersonFalling, FaPlus } from 'react-icons/fa6'
import { useModalState } from '../helpers/useModalState'
import { FaDumbbell } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import { IconType } from 'react-icons/lib'
import { LinkContainer } from 'react-router-bootstrap'
import { isIos, isInStandaloneMode } from '../helpers/iosUtils'

const QuickAddRow = ({ name, url, icon: Icon }: { name: string; url: string; icon: IconType }) => (
  <LinkContainer to={url}>
    <div className="quick-add-row">
      <Button variant="secondary" className="py-0">
        {name}
      </Button>
      <Button variant="secondary" className="quick-add-button">
        <Icon />
      </Button>
    </div>
  </LinkContainer>
)

export const QuickAddMenu = (props) => {
  const [isOpen, setOpen, setClosed] = useModalState(false)

  return (
    <>
      <IconContext.Provider value={{ size: '24' }}>
        <Button
          className={`quick-add-button plus ${(isOpen && 'open') || ''}`}
          onClick={isOpen ? setClosed : setOpen}
        >
          <FaPlus />
        </Button>
        <Modal
          show={isOpen}
          onHide={setClosed}
          dialogAs="div"
          className=""
          dialogClassName={`quick-add-modal ${props.addIOSPadding ? 'ios' : ''}`}
        >
          <QuickAddRow name="Workout" icon={FaDumbbell} url={'/workouts?new=true'} />
          <QuickAddRow name="Session" icon={FaPersonFalling} url="/newSession" />
        </Modal>
      </IconContext.Provider>
    </>
  )
}

export default QuickAddMenu
